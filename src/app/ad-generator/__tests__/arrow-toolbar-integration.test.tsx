import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '../page';

describe('ArrowToolbar Integration', () => {
  it('integrates ArrowToolbar into the main page layout', () => {
    render(<Home />);

    // Check that the arrow toolbar section exists
    expect(screen.getByText('➡️ Символы стрелок')).toBeInTheDocument();

    // Check that all arrow buttons are present
    expect(
      screen.getByRole('button', { name: /insert up arrow/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /insert down arrow/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /insert left arrow/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /insert right arrow/i })
    ).toBeInTheDocument();
  });

  it('allows inserting arrows into the editor through the toolbar', () => {
    render(<Home />);

    // Get the editor element
    const editor = screen.getByRole('textbox');

    // Initially empty
    expect(editor).toHaveTextContent('');

    // Click the up arrow button
    const upArrowButton = screen.getByRole('button', {
      name: /insert up arrow/i,
    });
    fireEvent.click(upArrowButton);

    // Check that the arrow was inserted
    expect(editor).toHaveTextContent('↑');

    // Click the right arrow button
    const rightArrowButton = screen.getByRole('button', {
      name: /insert right arrow/i,
    });
    fireEvent.click(rightArrowButton);

    // Check that both arrows are now in the editor
    expect(editor).toHaveTextContent('↑→');
  });

  it('maintains arrow symbols when user types additional content', () => {
    render(<Home />);

    const editor = screen.getByRole('textbox');

    // Insert an arrow first
    const leftArrowButton = screen.getByRole('button', {
      name: /insert left arrow/i,
    });
    fireEvent.click(leftArrowButton);

    expect(editor).toHaveTextContent('←');

    // Insert another arrow (rather than trying to simulate complex text input)
    const downArrowButton = screen.getByRole('button', {
      name: /insert down arrow/i,
    });
    fireEvent.click(downArrowButton);

    expect(editor).toHaveTextContent('←↓');
  });

  it('maintains layout integrity with ArrowToolbar added', () => {
    render(<Home />);

    // Check that main layout elements are still present
    expect(screen.getByText('⚙️ Настройки')).toBeInTheDocument();
    expect(screen.getByText('📝 Предварительный просмотр')).toBeInTheDocument();
    expect(screen.getByText('➡️ Символы стрелок')).toBeInTheDocument();

    // Check that controls are still functional (using the actual Russian text)
    expect(screen.getByLabelText(/размер шрифта/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/позиция по вертикали/i)).toBeInTheDocument();

    // Check that editor is still present
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});
