import { render, screen } from '@testing-library/react';
import BusinessCardPage from '../page';

describe('BusinessCardPage', () => {
  it('renders correctly', () => {
    render(<BusinessCardPage />);

    // Check for tool title/breadcrumb
    expect(screen.getByText(/Визитные карточки/i)).toBeInTheDocument();
    
    // Check for business card content (from the default data)
    expect(screen.getAllByText(/Лавка здоровья и красоты/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/8-926-397-33-23/i)[0]).toBeInTheDocument();
  });

  it('contains a print button', () => {
    render(<BusinessCardPage />);
    const printButton = screen.getByRole('button', { name: /Печать визиток/i });
    expect(printButton).toBeInTheDocument();
  });
});
