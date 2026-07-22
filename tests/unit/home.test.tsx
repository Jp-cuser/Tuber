import { fireEvent, render, screen } from '@testing-library/react';
import Home from '@/pages/index';

describe('Home', () => {
  beforeEach(() => {
    localStorage.clear();
    Object.defineProperty(navigator, 'language', {
      configurable: true,
      value: 'ja-JP',
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
});
