import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { Ollama } from 'ollama';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const MODEL = process.env.MODEL || 'deepseek-r1:1.5b';
const SYSTEM_PROMPT = process.env.SYSTEM_PROMPT || 'You are a helpful assistant.';
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';

const client = new Ollama({ host: OLLAMA_HOST });

app.get('/health', async (_req, res) => {
  try {
    const ls = await client.list();
    const available = !!ls.models?.find(m => m.name.startsWith(MODEL.split(':')[0]));
    res.json({ status: 'ok', model: MODEL, available });
  } catch (e) {
    res.status(500).json({ status: 'error', error: String(e) });
  }
});

app.post('/chat', async (req, res) => {
  try {
    const { prompt, system } = req.body || {};
    if (!prompt) return res.status(400).json({ error: 'prompt required' });

    const response = await client.chat({
      model: MODEL,
      messages: [
        { role: 'system', content: system || SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      stream: false
    });

    res.json({ reply: response.message?.content ?? '', raw: response, model: MODEL });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.post('/chat/stream', async (req, res) => {
  try {
    const { prompt, system } = req.body || {};
    if (!prompt) { res.status(400); return res.end('prompt required'); }

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = await client.chat({
      model: MODEL,
      messages: [
        { role: 'system', content: system || SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      stream: true
    });

    for await (const part of stream) {
      const chunk = part.message?.content || '';
      res.write(`data: ${JSON.stringify({ delta: chunk })}\n\n`);
    }
    res.write('data: {"end": true}\n\n');
    res.end();
  } catch (e) {
    res.write(`data: ${JSON.stringify({ error: String(e) })}\n\n`);
    res.end();
  }
});

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => console.log(`Local AI server at http://localhost:${PORT}`));
