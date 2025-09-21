#!/bin/bash

# Simple test script for MCP Chatbot

echo "🤖 Testing MCP Chatbot Server..."
echo

# Start server in background
echo "Starting server..."
npm start &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Test health endpoint
echo "Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s http://localhost:3000/health)
if [[ $HEALTH_RESPONSE == *"OK"* ]]; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed"
    echo "Response: $HEALTH_RESPONSE"
fi

# Test chat API
echo "Testing chat API..."
CHAT_RESPONSE=$(curl -s -X POST http://localhost:3000/api/chat \
    -H "Content-Type: application/json" \
    -d '{"message":"Hello, test message"}')

if [[ $CHAT_RESPONSE == *"AI service is currently unavailable"* ]]; then
    echo "✅ Chat API working (expected fallback response)"
else
    echo "❌ Chat API unexpected response"
    echo "Response: $CHAT_RESPONSE"
fi

# Test config endpoint
echo "Testing config endpoint..."
CONFIG_RESPONSE=$(curl -s http://localhost:3000/api/chat/config)
if [[ $CONFIG_RESPONSE == *"deepseek-chat"* ]]; then
    echo "✅ Config endpoint working"
else
    echo "❌ Config endpoint failed"
    echo "Response: $CONFIG_RESPONSE"
fi

# Test static file serving
echo "Testing static file serving..."
INDEX_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/)
if [[ $INDEX_RESPONSE == "200" ]]; then
    echo "✅ Static file serving working"
else
    echo "❌ Static file serving failed (HTTP $INDEX_RESPONSE)"
fi

# Clean up
echo
echo "Stopping server..."
kill $SERVER_PID
wait $SERVER_PID 2>/dev/null

echo "🎉 All tests completed!"