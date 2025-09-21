### API
GET /health -> { status, model, available }
POST /chat { prompt, system? } -> { reply, raw, model }
POST /chat/stream { prompt, system? } -> SSE stream of { delta }
