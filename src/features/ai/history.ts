import type { Message } from './types';

export class ShortTermHistory {
  private messages: Message[] = [];
  constructor(private readonly maximum: number) {
    if (!Number.isInteger(maximum) || maximum < 1)
      throw new Error('History maximum must be a positive integer');
  }
  add(message: Message): void {
    this.messages = [...this.messages, message].slice(-this.maximum);
  }
  list(): readonly Message[] {
    return [...this.messages];
  }
  clear(): void {
    this.messages = [];
  }
}
