import { render, screen } from '@testing-library/react';
import Home from '@/pages/index';

describe('Home', () => {
  it('renders the Phase 0 status', () => {
    render(<Home />);
    expect(
      screen.getByRole('heading', { name: 'LocalAITuber' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('正常に動作');
  });
});
