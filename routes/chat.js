const express = require('express');
const axios = require('axios');
const router = express.Router();

// Store conversation history (in production, use a database)
const conversations = new Map();

// AI Service integration
class AIService {
    constructor() {
        this.apiUrl = process.env.AI_API_URL || 'http://localhost:8000/v1/chat/completions';
        this.apiKey = process.env.AI_API_KEY || '';
        this.model = process.env.AI_MODEL || 'deepseek-chat';
        this.maxTokens = parseInt(process.env.MAX_TOKENS) || 1000;
        this.temperature = parseFloat(process.env.TEMPERATURE) || 0.7;
    }

    async generateResponse(messages) {
        try {
            const headers = {
                'Content-Type': 'application/json'
            };

            // Add API key if provided
            if (this.apiKey) {
                headers['Authorization'] = `Bearer ${this.apiKey}`;
            }

            const response = await axios.post(this.apiUrl, {
                model: this.model,
                messages: messages,
                max_tokens: this.maxTokens,
                temperature: this.temperature,
                stream: false
            }, {
                headers,
                timeout: 30000 // 30 second timeout
            });

            return response.data.choices[0].message.content;
        } catch (error) {
            console.error('AI Service Error:', error.message);
            
            // Fallback response if AI service is not available
            if (error.code === 'ECONNREFUSED' || error.response?.status >= 500) {
                return "I'm sorry, but the AI service is currently unavailable. Please make sure your local AI server is running and properly configured.";
            }
            
            throw new Error(`AI service error: ${error.message}`);
        }
    }
}

const aiService = new AIService();

// POST /api/chat - Send a message and get AI response
router.post('/', async (req, res) => {
    try {
        const { message, conversationId = 'default' } = req.body;

        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: 'Message is required and must be a string' });
        }

        // Get or create conversation history
        if (!conversations.has(conversationId)) {
            conversations.set(conversationId, [
                {
                    role: 'system',
                    content: 'You are a helpful AI assistant. Be concise and helpful in your responses.'
                }
            ]);
        }

        const conversation = conversations.get(conversationId);
        
        // Add user message to conversation
        conversation.push({
            role: 'user',
            content: message
        });

        // Get AI response
        const aiResponse = await aiService.generateResponse(conversation);

        // Add AI response to conversation
        conversation.push({
            role: 'assistant',
            content: aiResponse
        });

        // Keep conversation history manageable (last 20 messages + system message)
        if (conversation.length > 21) {
            conversation.splice(1, conversation.length - 21);
        }

        res.json({
            response: aiResponse,
            conversationId,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ 
            error: 'Failed to generate response',
            message: error.message
        });
    }
});

// GET /api/chat/history/:conversationId - Get conversation history
router.get('/history/:conversationId', (req, res) => {
    const { conversationId } = req.params;
    const conversation = conversations.get(conversationId) || [];
    
    // Filter out system message for client
    const history = conversation.filter(msg => msg.role !== 'system');
    
    res.json({
        conversationId,
        history,
        messageCount: history.length
    });
});

// DELETE /api/chat/history/:conversationId - Clear conversation history
router.delete('/history/:conversationId', (req, res) => {
    const { conversationId } = req.params;
    conversations.delete(conversationId);
    
    res.json({
        message: 'Conversation history cleared',
        conversationId
    });
});

// GET /api/chat/config - Get AI configuration info
router.get('/config', (req, res) => {
    res.json({
        model: aiService.model,
        maxTokens: aiService.maxTokens,
        temperature: aiService.temperature,
        apiUrl: aiService.apiUrl,
        hasApiKey: !!aiService.apiKey
    });
});

module.exports = router;