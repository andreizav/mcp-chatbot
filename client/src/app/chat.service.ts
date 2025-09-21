import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export type ChatTurn = { role: 'user' | 'assistant' | 'assistant-temp', content: string };

@Injectable()
export class ChatService {
  constructor(private http: HttpClient) {}

  async chat(prompt: string): Promise<string> {
    const res = await this.http.post<{ reply: string }>(
      '/api/chat', { prompt }
    ).toPromise();
    return res?.reply ?? '';
  }

  async chatStream(prompt: string, onDelta: (chunk: string) => void): Promise<void> {
    const resp = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    const reader = resp.body?.getReader();
    if (!reader) return;
    const decoder = new TextDecoder();
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const text = decoder.decode(value, { stream: true });
      // SSE frames split by "\n\n"
      for (const line of text.split('\n\n')) {
        if (!line.startsWith('data:')) continue;
        try {
          const json = JSON.parse(line.slice(5).trim());
          if (json.delta) onDelta(json.delta);
        } catch {}
      }
    }
  }
}
