import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ArrowToolbar from '../ArrowToolbar';
import type { AppState } from '@/app/ad-generator/state';

const mockState: AppState = {
  debugMode: false,
  paperFormat: 'a4-portrait',
  fontSize: 50,
  verticalPosition: 50,
  editorContent: 'Hello world',
};

const mockSetState = jest.fn();

describe('ArrowToolbar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Structure', () => {
    it('renders the arrow toolbar component', () => {
      render(<ArrowToolbar state={mockState} setState={mockSetState} />);

      expect(
        screen.getByRole('toolbar', { name: /arrow symbols/i })
      ).toBeInTheDocument();
    });

    it('displays all four arrow direction buttons', () => {
      render(<ArrowToolbar state={mockState} setState={mockSetState} />);

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

    it('shows arrow icons for each button', () => {
      render(<ArrowToolbar state={mockState} setState={mockSetState} />);

      // The buttons should contain arrow icons (we'll check for presence of svg elements)
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(4);

      // Each button should have an icon (svg element)
      buttons.forEach(button => {
        expect(button.querySelector('svg')).toBeInTheDocument();
      });
    });
  });

  describe('Arrow Insertion Functionality', () => {
    it('inserts up arrow (↑) when up arrow button is clicked', () => {
      render(<ArrowToolbar state={mockState} setState={mockSetState} />);

      const upArrowButton = screen.getByRole('button', {
        name: /insert up arrow/i,
      });
      fireEvent.click(upArrowButton);

      expect(mockSetState).toHaveBeenCalledWith({
        ...mockState,
        editorContent: 'Hello world↑',
      });
    });

    it('inserts down arrow (↓) when down arrow button is clicked', () => {
      render(<ArrowToolbar state={mockState} setState={mockSetState} />);

      const downArrowButton = screen.getByRole('button', {
        name: /insert down arrow/i,
      });
      fireEvent.click(downArrowButton);

      expect(mockSetState).toHaveBeenCalledWith({
        ...mockState,
        editorContent: 'Hello world↓',
      });
    });

    it('inserts left arrow (←) when left arrow button is clicked', () => {
      render(<ArrowToolbar state={mockState} setState={mockSetState} />);

      const leftArrowButton = screen.getByRole('button', {
        name: /insert left arrow/i,
      });
      fireEvent.click(leftArrowButton);

      expect(mockSetState).toHaveBeenCalledWith({
        ...mockState,
        editorContent: 'Hello world←',
      });
    });

    it('inserts right arrow (→) when right arrow button is clicked', () => {
      render(<ArrowToolbar state={mockState} setState={mockSetState} />);

      const rightArrowButton = screen.getByRole('button', {
        name: /insert right arrow/i,
      });
      fireEvent.click(rightArrowButton);

      expect(mockSetState).toHaveBeenCalledWith({
        ...mockState,
        editorContent: 'Hello world→',
      });
    });
  });

  describe('Multiple Arrow Insertions', () => {
    it('appends multiple arrows when buttons are clicked multiple times', () => {
      const { rerender } = render(
        <ArrowToolbar state={mockState} setState={mockSetState} />
      );

      // First click - up arrow
      const upArrowButton = screen.getByRole('button', {
        name: /insert up arrow/i,
      });
      fireEvent.click(upArrowButton);

      expect(mockSetState).toHaveBeenCalledWith({
        ...mockState,
        editorContent: 'Hello world↑',
      });

      // Simulate state update
      const stateAfterFirst = { ...mockState, editorContent: 'Hello world↑' };
      rerender(
        <ArrowToolbar state={stateAfterFirst} setState={mockSetState} />
      );

      // Second click - right arrow
      const rightArrowButton = screen.getByRole('button', {
        name: /insert right arrow/i,
      });
      fireEvent.click(rightArrowButton);

      expect(mockSetState).toHaveBeenCalledWith({
        ...stateAfterFirst,
        editorContent: 'Hello world↑→',
      });
    });
  });

  describe('Empty Content Handling', () => {
    it('inserts arrow into empty content', () => {
      const emptyState = { ...mockState, editorContent: '' };
      render(<ArrowToolbar state={emptyState} setState={mockSetState} />);

      const upArrowButton = screen.getByRole('button', {
        name: /insert up arrow/i,
      });
      fireEvent.click(upArrowButton);

      expect(mockSetState).toHaveBeenCalledWith({
        ...emptyState,
        editorContent: '↑',
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for screen readers', () => {
      render(<ArrowToolbar state={mockState} setState={mockSetState} />);

      expect(screen.getByRole('toolbar')).toHaveAttribute(
        'aria-label',
        'Arrow symbols toolbar'
      );
      expect(
        screen.getByRole('button', { name: /insert up arrow/i })
      ).toHaveAttribute('aria-label', 'Insert up arrow');
      expect(
        screen.getByRole('button', { name: /insert down arrow/i })
      ).toHaveAttribute('aria-label', 'Insert down arrow');
      expect(
        screen.getByRole('button', { name: /insert left arrow/i })
      ).toHaveAttribute('aria-label', 'Insert left arrow');
      expect(
        screen.getByRole('button', { name: /insert right arrow/i })
      ).toHaveAttribute('aria-label', 'Insert right arrow');
    });

    it('supports keyboard navigation', () => {
      render(<ArrowToolbar state={mockState} setState={mockSetState} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('tabIndex', '0');
      });
    });
  });

  describe('Visual Styling', () => {
    it('applies correct CSS classes for styling', () => {
      render(<ArrowToolbar state={mockState} setState={mockSetState} />);

      const toolbar = screen.getByRole('toolbar');
      expect(toolbar).toHaveClass(
        'flex',
        'gap-2',
        'p-2',
        'bg-gray-50',
        'rounded-lg',
        'border'
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveClass(
          'px-3',
          'py-2',
          'bg-white',
          'border',
          'border-gray-300',
          'rounded',
          'hover:bg-gray-50',
          'hover:border-gray-400',
          'transition-colors',
          'duration-200',
          'flex',
          'items-center',
          'justify-center'
        );
      });
    });
  });
});
