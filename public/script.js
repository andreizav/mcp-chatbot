class ChatApp {
    constructor() {
        this.conversationId = 'default';
        this.isConnected = false;
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkHealth();
        this.loadChatHistory();
    }

    bindEvents() {
        const messageForm = document.getElementById('message-form');
        const messageInput = document.getElementById('message-input');
        const clearChatBtn = document.getElementById('clear-chat');
        const showConfigBtn = document.getElementById('show-config');
        const configModal = document.getElementById('config-modal');
        const closeModal = document.querySelector('.close');

        messageForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const message = messageInput.value.trim();
            if (message) {
                this.sendMessage(message);
                messageInput.value = '';
            }
        });

        clearChatBtn.addEventListener('click', () => {
            this.clearChat();
        });

        showConfigBtn.addEventListener('click', () => {
            this.showConfig();
        });

        closeModal.addEventListener('click', () => {
            configModal.classList.add('hidden');
        });

        configModal.addEventListener('click', (e) => {
            if (e.target === configModal) {
                configModal.classList.add('hidden');
            }
        });

        // Enter key to send message
        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                messageForm.dispatchEvent(new Event('submit'));
            }
        });
    }

    async checkHealth() {
        try {
            const response = await fetch('/health');
            const data = await response.json();
            
            if (data.status === 'OK') {
                this.setStatus('connected', 'Connected');
                this.isConnected = true;
                this.enableInput();
            } else {
                throw new Error('Health check failed');
            }
        } catch (error) {
            console.error('Health check failed:', error);
            this.setStatus('error', 'Connection Error');
            this.isConnected = false;
            this.disableInput();
        }
    }

    setStatus(type, text) {
        const indicator = document.getElementById('status-indicator');
        const statusText = document.getElementById('status-text');
        
        indicator.className = `status-indicator ${type}`;
        statusText.textContent = text;
    }

    enableInput() {
        document.getElementById('message-input').disabled = false;
        document.getElementById('send-button').disabled = false;
    }

    disableInput() {
        document.getElementById('message-input').disabled = true;
        document.getElementById('send-button').disabled = true;
    }

    async loadChatHistory() {
        try {
            const response = await fetch(`/api/chat/history/${this.conversationId}`);
            const data = await response.json();
            
            if (data.history && data.history.length > 0) {
                const messagesContainer = document.getElementById('messages');
                messagesContainer.innerHTML = '';
                
                data.history.forEach(msg => {
                    this.addMessage(msg.content, msg.role);
                });
            }
        } catch (error) {
            console.error('Failed to load chat history:', error);
        }
    }

    async sendMessage(message) {
        if (!this.isConnected) {
            this.addMessage('Please wait for connection to be established.', 'system');
            return;
        }

        // Add user message to chat
        this.addMessage(message, 'user');
        
        // Show typing indicator
        this.showTypingIndicator();
        
        // Disable input while processing
        this.disableInput();

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message,
                    conversationId: this.conversationId
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Remove typing indicator and add response
                this.hideTypingIndicator();
                this.addMessage(data.response, 'assistant');
            } else {
                throw new Error(data.message || 'Failed to get response');
            }
        } catch (error) {
            console.error('Send message error:', error);
            this.hideTypingIndicator();
            this.addMessage(`Error: ${error.message}`, 'system');
        } finally {
            // Re-enable input
            this.enableInput();
        }
    }

    addMessage(content, role) {
        const messagesContainer = document.getElementById('messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;
        messageDiv.textContent = content;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('messages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.id = 'typing-indicator';
        typingDiv.textContent = 'AI is typing...';
        
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    async clearChat() {
        try {
            const response = await fetch(`/api/chat/history/${this.conversationId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                document.getElementById('messages').innerHTML = '';
                this.addMessage('Chat history cleared.', 'system');
            } else {
                throw new Error('Failed to clear chat');
            }
        } catch (error) {
            console.error('Clear chat error:', error);
            this.addMessage(`Error clearing chat: ${error.message}`, 'system');
        }
    }

    async showConfig() {
        try {
            const response = await fetch('/api/chat/config');
            const config = await response.json();
            
            const configInfo = document.getElementById('config-info');
            configInfo.innerHTML = `
                <h3>AI Configuration</h3>
                <p><strong>Model:</strong> ${config.model}</p>
                <p><strong>API URL:</strong> ${config.apiUrl}</p>
                <p><strong>Max Tokens:</strong> ${config.maxTokens}</p>
                <p><strong>Temperature:</strong> ${config.temperature}</p>
                <p><strong>API Key:</strong> ${config.hasApiKey ? 'Configured' : 'Not configured'}</p>
            `;
            
            document.getElementById('config-modal').classList.remove('hidden');
        } catch (error) {
            console.error('Failed to load config:', error);
            this.addMessage('Failed to load configuration.', 'system');
        }
    }
}

// Initialize the chat app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ChatApp();
});