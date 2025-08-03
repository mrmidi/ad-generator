import { render, screen } from '@testing-library/react';
import Debug from '../Debug';

describe('Debug', () => {
  it('renders the debug block', () => {
    render(<Debug />);

    const debugBlock = screen.getByText(/debug messages/i);
    expect(debugBlock).toBeInTheDocument();
  });
});
