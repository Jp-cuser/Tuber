import { TextDecoder } from 'node:util';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Home from '@/pages/index';
import { useSettingsStore } from '@/features/settings/store';
import { defaultSettings } from '@/features/settings/types';

describe('Home', () => {
  beforeEach(() => {
    localStorage.clear();
    useSettingsStore.setState(defaultSettings);
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

  it('offers every supported Whisper transcription model', () => {
    render(<Home />);
    fireEvent.click(screen.getByRole('button', { name: 'はじめる' }));
    const model = screen.getByLabelText('Whisper transcription model');
    expect(model).toHaveValue('gpt-4o-mini-transcribe');
    expect(model.querySelectorAll('option')).toHaveLength(3);
    expect(
      screen.getByRole('button', { name: 'Transcribe audio file' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Silence timeout progress')).toHaveValue(0);
  });

  it('changes avatar pose, motion, and emotion controls', () => {
    render(<Home />);
    fireEvent.click(screen.getByRole('button', { name: 'はじめる' }));
    const pose = screen.getByLabelText('Avatar pose');
    const motion = screen.getByLabelText('Avatar motion');
    const emotion = screen.getByLabelText('Avatar emotion');

    fireEvent.change(pose, { target: { value: 'wave' } });
    fireEvent.change(motion, { target: { value: 'still' } });
    fireEvent.change(emotion, { target: { value: 'happy' } });

    expect(pose).toHaveValue('wave');
    expect(motion).toHaveValue('still');
    expect(emotion).toHaveValue('happy');
  });

  it('persists avatar transforms and locks position controls', () => {
    render(<Home />);
    fireEvent.click(screen.getByRole('button', { name: 'はじめる' }));
    const position = screen.getByLabelText('Avatar position X');
    const lock = screen.getByLabelText('Lock avatar position');

    fireEvent.change(position, { target: { value: '1.5' } });
    expect(position).toHaveValue('1.5');
    expect(localStorage.getItem('local-ai-tuber-vrm-presentation')).toContain(
      '"positionX":1.5',
    );

    fireEvent.click(lock);
    expect(lock).toBeChecked();
    expect(position).toBeDisabled();
  });

  it('switches to MotionPNGTuber controls', () => {
    render(<Home />);
    fireEvent.click(screen.getByRole('button', { name: 'はじめる' }));
    fireEvent.change(screen.getByLabelText('Avatar mode'), {
      target: { value: 'pngtuber' },
    });

    expect(screen.getByRole('button', { name: 'Idle video' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Talking video' })).toBeVisible();
    fireEvent.change(screen.getByLabelText('PNGTuber sensitivity'), {
      target: { value: '0.8' },
    });
    expect(screen.getByLabelText('PNGTuber sensitivity')).toHaveValue('0.8');
    fireEvent.click(screen.getByLabelText('Enable PNGTuber chroma key'));
    fireEvent.change(screen.getByLabelText('PNGTuber chroma tolerance'), {
      target: { value: '0.35' },
    });
    fireEvent.change(screen.getByLabelText('PNGTuber scale'), {
      target: { value: '1.5' },
    });
    expect(screen.getByLabelText('Enable PNGTuber chroma key')).toBeChecked();
    expect(screen.getByLabelText('PNGTuber scale')).toHaveValue('1.5');
    expect(
      localStorage.getItem('local-ai-tuber-pngtuber-presentation'),
    ).toContain('"chromaTolerance":0.35');
  });

  it('exposes the user-supplied Live2D runtime configuration', () => {
    render(<Home />);
    fireEvent.click(screen.getByRole('button', { name: 'はじめる' }));
    fireEvent.change(screen.getByLabelText('Avatar mode'), {
      target: { value: 'live2d' },
    });
    expect(screen.getByLabelText('Live2D Core script')).toHaveValue(
      '/live2d/live2dcubismcore.min.js',
    );
    expect(screen.getByLabelText('Live2D bridge script')).toHaveValue(
      '/live2d/runtime.js',
    );
    expect(screen.getByLabelText('Live2D model manifest')).toHaveValue(
      '/live2d/avatar/avatar.model3.json',
    );
    expect(screen.getByRole('button', { name: 'Load Live2D' })).toBeVisible();
    fireEvent.change(screen.getByLabelText('Live2D expression'), {
      target: { value: 'happy' },
    });
    fireEvent.change(screen.getByLabelText('Live2D motion group'), {
      target: { value: 'TapBody' },
    });
    expect(screen.getByLabelText('Live2D expression')).toHaveValue('happy');
    expect(screen.getByLabelText('Live2D motion group')).toHaveValue('TapBody');
  });

  it('reports unsupported browser speech recognition safely', () => {
    render(<Home />);
    fireEvent.click(screen.getByRole('button', { name: 'はじめる' }));
    fireEvent.click(screen.getByLabelText('Start microphone'));
    expect(
      screen.getByText('Browser speech recognition is not supported'),
    ).toBeVisible();
  });

  it('sends chat history to the AI API and renders the response', async () => {
    useSettingsStore.setState({
      reasoningEnabled: true,
      reasoningEffort: 'high',
      reasoningTokenBudget: 2048,
      reasoningVisible: true,
      searchGroundingEnabled: true,
      searchGroundingDynamicThreshold: true,
    });
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
                `data: ${JSON.stringify({ choices: [{ delta: { reasoning_content: 'Reasoning trace', content: 'Generated response' } }] })}\n\ndata: [DONE]\n\n`,
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
    const body = (globalThis.fetch as jest.Mock).mock.calls[0][1]
      .body as string;
    expect(JSON.parse(body)).toMatchObject({
      reasoning: { enabled: true, effort: 'high', tokenBudget: 2048 },
      searchGrounding: { enabled: true, dynamicThreshold: true },
    });
    expect(screen.getByText('Reasoning trace')).toBeInTheDocument();
  });
});
