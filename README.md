# Local LLM (Ollama) + Node API + Angular UI

## Structure
- server/ — Node.js API that talks to Ollama (local LLM)
- client/ — Angular 17 standalone app (simple chat UI)

## Quick start
1) Install and run Ollama, pull a small model:
```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama serve
ollama pull deepseek-r1:1.5b
```

2) Server:
```bash
cd server
cp .env.example .env   # adjust if needed
npm i
npm run dev
```

3) Client:
```bash
cd client
npm i
npm start
```
Open Angular UI at http://localhost:4200 (proxy to http://localhost:3000).

---

### Notes
- Change model in `server/.env` (MODEL=...).
- SSE streaming endpoint available at POST /chat/stream.
- Angular uses HttpClient; proxy config routes /api to server.
