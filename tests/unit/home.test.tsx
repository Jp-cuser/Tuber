import { TextDecoder } from 'node:util';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Home from '@/pages/index';

describe('Home', () => {
  beforeEach(() => {
    localStorage.clear();
    Object.defineProperty(navigator, 'language', {
      configurable: true,
      value: 'ja-JP',
    });
    Object.defineProperty(globalThis.crypto, 'randomUUID', {
      configurable: true,
      value: jest
        .fn()
        .mockReturnValueOnce('user-message')
        .mockReturnValueOnce('assistant-message'),
    });
    Object.defineProperty(globalThis, 'TextDecoder', {
      configurable: true,
      value: TextDecoder,
    });
  });

  it('moves from the introduction into the studio', () => {
    render(<Home />);
    expect(
      screen.getByRole('heading', { name: 'あなたのローカルAIキャラクター' }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'はじめる' }));
    expect(screen.getByLabelText('character stage')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Phase 2');
  });

  it('opens the settings panel', () => {
    render(<Home />);
    fireEvent.click(screen.getByRole('button', { name: 'はじめる' }));
    fireEvent.click(screen.getByRole('button', { name: '設定' }));
    expect(
      screen.getByRole('complementary', { name: '設定' }),
    ).toBeInTheDocument();
  });

  it('sends chat history to the AI API and renders the response', async () => {
    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'text/event-stream' }),
        body: {
          getReader: () => {
            const chunks = [
              Buffer.from(
                `data: ${JSON.stringify({ choices: [{ delta: { content: 'Generated response' } }] })}\n\ndata: [DONE]\n\n`,
              ),
            ];
            return {
              read: jest.fn(async () => {
                const value = chunks.shift();
                return value
                  ? { done: false, value }
                  : { done: true, value: undefined };
              }),
              releaseLock: jest.fn(),
            };
          },
        },
      }),
    });
    render(<Home />);
    fireEvent.click(screen.getAllByRole('button')[0]);
    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: 'Hello AI' } });
    fireEvent.submit(input.closest('form') as HTMLFormElement);

    await waitFor(() =>
      expect(screen.getAllByText('Generated response').length).toBeGreaterThan(
        0,
      ),
    );
    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/ai/stream',
      expect.objectContaining({
        body: expect.stringContaining('Hello AI'),
      }),
    );
  });
});
