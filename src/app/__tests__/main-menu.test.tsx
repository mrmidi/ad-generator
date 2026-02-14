import { render, screen } from '@testing-library/react';
import MainMenu from '../page';

describe('MainMenu', () => {
  it('renders welcome message and tool cards', () => {
    render(<MainMenu />);

    expect(screen.getByText(/Добро пожаловать/i)).toBeInTheDocument();
    expect(screen.getByText(/Генератор объявлений/i)).toBeInTheDocument();
    expect(screen.getByText(/Визитные карточки/i)).toBeInTheDocument();
  });
});
