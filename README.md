# MCP Chatbot

An MVP chatbot server with local AI integration, designed to work with DeepSeek and other OpenAI-compatible local AI services.

## Features

- 🤖 **Local AI Integration**: Works with DeepSeek and other OpenAI-compatible APIs
- 💬 **Web-based Chat Interface**: Clean, responsive chat UI
- 🔄 **Conversation Management**: Maintains conversation history
- ⚙️ **Configurable**: Easy setup with environment variables
- 🚀 **Lightweight**: Minimal dependencies, fast startup

## Quick Start

### Prerequisites

- Node.js 16+ installed
- A local AI service running (like DeepSeek, Ollama, etc.) that provides OpenAI-compatible API

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd mcp-chatbot
```

2. Install dependencies:
```bash
npm install
```

3. Configure the environment:
```bash
cp .env.example .env
```

4. Edit `.env` file with your AI service configuration:
```env
AI_API_URL=http://localhost:8000/v1/chat/completions
AI_API_KEY=your_api_key_here
AI_MODEL=deepseek-chat
PORT=3000
```

5. Start the server:
```bash
npm start
```

6. Open your browser and navigate to `http://localhost:3000`

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `AI_API_URL` | URL of your local AI API endpoint | `http://localhost:8000/v1/chat/completions` |
| `AI_API_KEY` | API key for authentication (if required) | - |
| `AI_MODEL` | Model name to use | `deepseek-chat` |
| `PORT` | Server port | `3000` |
| `HOST` | Server host | `localhost` |
| `MAX_TOKENS` | Maximum tokens in AI response | `1000` |
| `TEMPERATURE` | AI response creativity (0.0-1.0) | `0.7` |

### Setting up Local AI Services

#### DeepSeek
If you're running DeepSeek locally, make sure it's accessible at the configured URL with OpenAI-compatible API.

#### Ollama
For Ollama, you can use:
```env
AI_API_URL=http://localhost:11434/v1/chat/completions
AI_MODEL=llama2
```

#### Other OpenAI-compatible services
The chatbot works with any service that implements the OpenAI chat completions API format.

## API Endpoints

### Chat Endpoints

- `POST /api/chat` - Send a message and get AI response
- `GET /api/chat/history/:conversationId` - Get conversation history
- `DELETE /api/chat/history/:conversationId` - Clear conversation history
- `GET /api/chat/config` - Get AI configuration info

### System Endpoints

- `GET /` - Serve the chat interface
- `GET /health` - Health check endpoint

## Development

### Running in Development Mode

```bash
npm run dev
```

This uses nodemon for automatic server restart on file changes.

### Project Structure

```
mcp-chatbot/
├── server.js              # Main server file
├── routes/
│   └── chat.js            # Chat API routes
├── public/
│   ├── index.html         # Chat interface
│   ├── styles.css         # Styles
│   └── script.js          # Frontend JavaScript
├── package.json
├── .env.example           # Environment template
└── README.md
```

## Troubleshooting

### Common Issues

1. **AI Service Unavailable**
   - Check if your local AI service is running
   - Verify the `AI_API_URL` in your `.env` file
   - Check firewall settings

2. **Connection Refused**
   - Ensure the AI service is accessible
   - Check if the port is correct
   - Verify network connectivity

3. **Authentication Errors**
   - Check if `AI_API_KEY` is correctly set
   - Verify the API key is valid

### Health Check

Visit `http://localhost:3000/health` to check the server status and configuration.

## License

MIT License