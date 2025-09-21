import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, ChatTurn } from './chat.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [ChatService]
})
export class AppComponent {
  prompt = '';
  loading = signal(false);
  stream = signal(true);
  history = signal<ChatTurn[]>([]);

  constructor(private api: ChatService) {}

  async send() {
    const text = this.prompt.trim();
    if (!text) return;
    this.history.update(h => [...h, { role: 'user', content: text }]);
    this.prompt = '';
    this.loading.set(true);

    if (this.stream()) {
      let acc = '';
      await this.api.chatStream(text, (delta) => {
        acc += delta;
        const h = this.history();
        if (h[h.length - 1]?.role === 'assistant-temp') {
          h[h.length - 1].content = acc;
          this.history.set([...h]);
        } else {
          this.history.update(x => [...x, { role: 'assistant-temp', content: acc }]);
        }
      });
      // finalize last temp to assistant
      const h = this.history();
      if (h.length && h[h.length - 1].role === 'assistant-temp') {
        h[h.length - 1].role = 'assistant';
        this.history.set([...h]);
      }
    } else {
      const reply = await this.api.chat(text);
      this.history.update(h => [...h, { role: 'assistant', content: reply }]);
    }

    this.loading.set(false);
  }

  clear() {
    this.history.set([]);
  }
}
