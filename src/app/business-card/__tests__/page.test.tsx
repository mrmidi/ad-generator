import { render, screen, fireEvent } from '@testing-library/react';
import BusinessCardPage from '../page';

describe('BusinessCardPage', () => {
  it('renders correctly with default compact mini-card format', () => {
    render(<BusinessCardPage />);

    // Check for tool title/breadcrumb
    expect(screen.getByText(/Визитные карточки/i)).toBeInTheDocument();

    // Check for compact business card content
    expect(
      screen.getAllByText(/Лавка здоровья и красоты/i)[0]
    ).toBeInTheDocument();
    expect(screen.getAllByText(/8-995-558-29-13/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Анна/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/24 шт/i)[0]).toBeInTheDocument();
  });

  it('allows switching to vertical card format with QR', () => {
    render(<BusinessCardPage />);

    // Click on vertical format button
    const verticalButton = screen.getByRole('button', {
      name: /Вертикальная \(9 шт\.\)/i,
    });
    fireEvent.click(verticalButton);

    // Verify vertical card content
    expect(screen.getAllByText(/8-926-397-33-23/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Сканируйте или перейдите/i)[0]).toBeInTheDocument();
  });

  it('contains a print button for the selected format', () => {
    render(<BusinessCardPage />);
    const printButton = screen.getByRole('button', { name: /Печать визиток/i });
    expect(printButton).toBeInTheDocument();
    expect(printButton).toHaveTextContent(/24 шт/i);

    // Switch to vertical
    const verticalButton = screen.getByRole('button', {
      name: /Вертикальная \(9 шт\.\)/i,
    });
    fireEvent.click(verticalButton);
    expect(screen.getByRole('button', { name: /Печать визиток \(9 шт\.\)/i })).toBeInTheDocument();
  });
});
