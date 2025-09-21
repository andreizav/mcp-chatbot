const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const chatRoutes = require('./routes/chat');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/chat', chatRoutes);

// Serve the main chat interface
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        aiConfig: {
            url: process.env.AI_API_URL || 'Not configured',
            model: process.env.AI_MODEL || 'deepseek-chat'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: err.message 
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, HOST, () => {
    console.log(`MCP Chatbot server running on http://${HOST}:${PORT}`);
    console.log(`AI API URL: ${process.env.AI_API_URL || 'Not configured'}`);
    console.log(`AI Model: ${process.env.AI_MODEL || 'deepseek-chat'}`);
});

module.exports = app;