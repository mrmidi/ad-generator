import { render, screen } from '@testing-library/react';
import Home from '../page';

describe('Home', () => {
  it('renders the header and breadcrumbs', () => {
    render(<Home />);

    const header = screen.getByText(/Инструменты красоты и здоровья/i);
    expect(header).toBeInTheDocument();

    const breadcrumb = screen.getByText(/Генератор объявлений/i);
    expect(breadcrumb).toBeInTheDocument();
  });
});
