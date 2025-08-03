import { render, screen, fireEvent } from '@testing-library/react';
import Editor from '../Editor';
import { initialState } from '@/app/state';

describe('Editor', () => {
  const mockSetState = jest.fn();

  it('renders the editor', () => {
    render(<Editor state={initialState} setState={mockSetState} />);

    const editor = screen.getByRole('textbox');
    expect(editor).toBeInTheDocument();
  });

  it('updates the editor content', () => {
    render(<Editor state={initialState} setState={mockSetState} />);

    const editor = screen.getByRole('textbox');
    // Our new implementation uses innerText, so we need to mock that
    Object.defineProperty(editor, 'innerText', {
      get: () => 'Hello, world!',
      set: () => {},
      configurable: true
    });
    
    fireEvent.input(editor, { 
      currentTarget: editor,
    });
    
    expect(mockSetState).toHaveBeenCalledWith({
      ...initialState,
      editorContent: 'Hello, world!',
    });
  });
});