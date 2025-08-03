import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import Editor from '../Editor';
import { initialState } from '@/app/state';

// Mock the layout utilities first, before any imports
jest.mock('../../utils/layout', () => ({
  calculateOptimalPaperSize: jest.fn(() => ({
    width: 595,
    height: 842,
    scale: 1,
  })),
  calculateScaledFont: jest.fn(() => ({
    fontSizePx: 16,
    lineHeightPx: 20,
  })),
  calculateVerticalTextPosition: jest.fn(() => ({
    paddingTop: 100,
    paddingBottom: 100,
    usableHeight: 600,
    textCenterY: 400,
  })),
  getUnscaledHeight: jest.fn(() => 842),
  measureTextHeightWithProbe: jest.fn(() => 50),
  sanitizeText: jest.fn((text: string) => {
    if (typeof text !== 'string') return '';
    return text.replace(/[^\p{L}\p{N}\p{P}\p{Z}]/gu, '');
  }),
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock document.execCommand
Object.defineProperty(document, 'execCommand', {
  value: jest.fn(() => true),
  writable: true,
});

// Mock getSelection
Object.defineProperty(document, 'getSelection', {
  value: jest.fn(() => ({
    anchorNode: null,
    removeAllRanges: jest.fn(),
    addRange: jest.fn(),
  })),
  writable: true,
});

// Mock createRange
Object.defineProperty(document, 'createRange', {
  value: jest.fn(() => ({
    selectNodeContents: jest.fn(),
    collapse: jest.fn(),
  })),
  writable: true,
});

describe('Editor', () => {
  const mockSetState = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock getBoundingClientRect for container
    Element.prototype.getBoundingClientRect = jest.fn(() => ({
      width: 800,
      height: 600,
      top: 0,
      left: 0,
      bottom: 600,
      right: 800,
      x: 0,
      y: 0,
      toJSON: jest.fn(),
    }));
  });

  describe('Component Structure', () => {
    it('renders the editor', () => {
      render(<Editor state={initialState} setState={mockSetState} />);

      const editor = screen.getByRole('textbox');
      expect(editor).toBeInTheDocument();
      expect(editor).toHaveAttribute('contentEditable', 'true');
      expect(editor).toHaveAttribute('dir', 'ltr');
    });

    it('renders with proper CSS classes and structure', () => {
      render(<Editor state={initialState} setState={mockSetState} />);

      const container = screen.getByRole('textbox').closest('.paper-container');
      expect(container).toBeInTheDocument();

      const paperElement = screen.getByRole('textbox').closest('.paper-base');
      expect(paperElement).toBeInTheDocument();
      expect(paperElement).toHaveClass('a4-portrait'); // default format
    });

    it('displays paper format indicator', () => {
      render(<Editor state={initialState} setState={mockSetState} />);

      expect(screen.getByText('📄 A4 Портрет')).toBeInTheDocument();
    });

    it('displays landscape format indicator when paperFormat is a4-landscape', () => {
      const landscapeState = {
        ...initialState,
        paperFormat: 'a4-landscape' as const,
      };
      render(<Editor state={landscapeState} setState={mockSetState} />);

      expect(screen.getByText('📄 A4 Ландшафт')).toBeInTheDocument();
    });
  });

  describe('Content Management', () => {
    it('updates the editor content on input', () => {
      render(<Editor state={initialState} setState={mockSetState} />);

      const editor = screen.getByRole('textbox');
      Object.defineProperty(editor, 'innerText', {
        get: () => 'Hello, world!',
        set: () => {},
        configurable: true,
      });

      fireEvent.input(editor, {
        currentTarget: editor,
      });

      expect(mockSetState).toHaveBeenCalledWith({
        ...initialState,
        editorContent: 'Hello, world!',
      });
    });

    it('reflects external state changes in editor content', async () => {
      const { rerender } = render(
        <Editor state={initialState} setState={mockSetState} />
      );

      const editor = screen.getByRole('textbox');
      const updatedState = {
        ...initialState,
        editorContent: 'Updated content',
      };

      rerender(<Editor state={updatedState} setState={mockSetState} />);

      await waitFor(() => {
        expect(editor.textContent).toBe('Updated content');
      });
    });

    it('handles input with text content', () => {
      render(<Editor state={initialState} setState={mockSetState} />);

      const editor = screen.getByRole('textbox');
      Object.defineProperty(editor, 'innerText', {
        get: () => 'Test content',
        set: jest.fn(),
        configurable: true,
      });

      fireEvent.input(editor, {
        currentTarget: editor,
      });

      expect(mockSetState).toHaveBeenCalledWith({
        ...initialState,
        editorContent: 'Test content',
      });
    });
  });

  describe('Paste Functionality', () => {
    it('prevents default paste behavior', () => {
      render(<Editor state={initialState} setState={mockSetState} />);

      const editor = screen.getByRole('textbox');
      const preventDefault = jest.fn();

      Object.defineProperty(editor, 'innerText', {
        get: () => 'Pasted content',
        set: () => {},
        configurable: true,
      });

      const pasteEvent = new Event('paste', { bubbles: true });
      Object.defineProperty(pasteEvent, 'preventDefault', {
        value: preventDefault,
        writable: true,
      });
      Object.defineProperty(pasteEvent, 'clipboardData', {
        value: {
          getData: jest.fn(() => 'Pasted content'),
        },
        writable: true,
      });

      editor.dispatchEvent(pasteEvent);

      expect(preventDefault).toHaveBeenCalled();
    });

    it('uses execCommand to insert text', () => {
      render(<Editor state={initialState} setState={mockSetState} />);

      const editor = screen.getByRole('textbox');

      Object.defineProperty(editor, 'innerText', {
        get: () => 'Test paste',
        set: () => {},
        configurable: true,
      });

      fireEvent.paste(editor, {
        preventDefault: jest.fn(),
        clipboardData: {
          getData: jest.fn(() => 'Test paste'),
        },
        currentTarget: editor,
      });

      expect(document.execCommand).toHaveBeenCalledWith(
        'insertText',
        false,
        'Test paste'
      );
    });

    it('handles paste with null clipboard data', () => {
      render(<Editor state={initialState} setState={mockSetState} />);

      const editor = screen.getByRole('textbox');

      Object.defineProperty(editor, 'innerText', {
        get: () => '',
        set: () => {},
        configurable: true,
      });

      fireEvent.paste(editor, {
        preventDefault: jest.fn(),
        clipboardData: null,
        currentTarget: editor,
      });

      expect(document.execCommand).toHaveBeenCalledWith(
        'insertText',
        false,
        ''
      );
    });
  });

  describe('ResizeObserver Integration', () => {
    it('sets up ResizeObserver on mount', () => {
      render(<Editor state={initialState} setState={mockSetState} />);

      expect(global.ResizeObserver).toHaveBeenCalled();
    });

    it('cleans up ResizeObserver on unmount', () => {
      const mockDisconnect = jest.fn();
      const mockObserver = {
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: mockDisconnect,
      };

      (global.ResizeObserver as jest.Mock).mockImplementation(
        () => mockObserver
      );

      const { unmount } = render(
        <Editor state={initialState} setState={mockSetState} />
      );

      unmount();

      expect(mockDisconnect).toHaveBeenCalled();
    });
  });

  describe('Selection Management', () => {
    it('provides selection management functionality', () => {
      const mockSelection = {
        anchorNode: null,
        removeAllRanges: jest.fn(),
        addRange: jest.fn(),
      };
      const mockRange = {
        selectNodeContents: jest.fn(),
        collapse: jest.fn(),
      };

      (document.getSelection as jest.Mock).mockReturnValue(mockSelection);
      (document.createRange as jest.Mock).mockReturnValue(mockRange);

      render(<Editor state={initialState} setState={mockSetState} />);

      // The component exists and doesn't crash
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });

  describe('Editor Attributes', () => {
    it('has correct accessibility attributes', () => {
      render(<Editor state={initialState} setState={mockSetState} />);

      const editor = screen.getByRole('textbox');
      expect(editor).toHaveAttribute('id', 'editor');
      expect(editor).toHaveAttribute('contentEditable', 'true');
      expect(editor).toHaveAttribute('dir', 'ltr');
      expect(editor).toHaveAttribute('data-placeholder', 'Все по 100 ₽');
    });

    it('renders editor with proper structure', () => {
      render(<Editor state={initialState} setState={mockSetState} />);

      const editor = screen.getByRole('textbox');
      const container = editor.closest('.paper-container');
      const paperDiv = editor.closest('.paper-base');

      expect(container).toBeInTheDocument();
      expect(paperDiv).toBeInTheDocument();
      expect(paperDiv).toHaveClass('paper-base', 'a4-portrait');
    });
  });

  describe('State Updates', () => {
    it('updates when paperFormat changes', () => {
      const { rerender } = render(
        <Editor state={initialState} setState={mockSetState} />
      );

      // Change paper format
      const updatedState = {
        ...initialState,
        paperFormat: 'a4-landscape' as const,
      };
      rerender(<Editor state={updatedState} setState={mockSetState} />);

      const paperDiv = screen.getByRole('textbox').closest('.paper-base');
      expect(paperDiv).toHaveClass('a4-landscape');
    });

    it('updates editor content when state changes', () => {
      const { rerender } = render(
        <Editor state={initialState} setState={mockSetState} />
      );

      const updatedState = { ...initialState, editorContent: 'New content' };
      rerender(<Editor state={updatedState} setState={mockSetState} />);

      // Component rerenders without crashing
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });

  describe('Layout Edge Cases', () => {
    it('handles edge cases in layout calculations gracefully', () => {
      render(<Editor state={initialState} setState={mockSetState} />);

      const editor = screen.getByRole('textbox');

      // Mock sanitizeText to return the content we expect
      const mockSanitizeText =
        jest.requireMock('../../utils/layout').sanitizeText;
      mockSanitizeText.mockReturnValueOnce('Test content for edge cases');

      // Just trigger layout by simulating input - component should handle edge cases gracefully
      fireEvent.input(editor, {
        currentTarget: {
          innerText: 'Test content for edge cases',
        },
      });

      // Component should handle any edge cases without crashing
      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(mockSetState).toHaveBeenCalledWith({
        ...initialState,
        editorContent: 'Test content for edge cases',
      });
    });

    it('applies proper font and padding styles during layout', () => {
      render(<Editor state={initialState} setState={mockSetState} />);

      const editor = screen.getByRole('textbox');

      // Trigger layout by changing content
      fireEvent.input(editor, {
        currentTarget: {
          ...editor,
          innerText: 'Test content',
        },
      });

      // The layout function should have run (component doesn't crash)
      expect(editor).toBeInTheDocument();
    });
  });

  describe('Debug Mode Coverage', () => {
    it('displays comprehensive debug information when debugMode is enabled', async () => {
      // Create a debug element for the component to find
      const debugElement = document.createElement('div');
      debugElement.id = 'debugMessages';
      document.body.appendChild(debugElement);

      // Mock getComputedStyle for the debug output
      const mockGetComputedStyle = jest.fn(() => ({
        direction: 'ltr',
      }));
      Object.defineProperty(window, 'getComputedStyle', {
        value: mockGetComputedStyle,
        writable: true,
      });

      const debugState = {
        ...initialState,
        debugMode: true,
        fontSize: 18,
        verticalPosition: 60,
      };

      render(<Editor state={debugState} setState={mockSetState} />);

      // Trigger layout to generate debug info by simulating input
      const editor = screen.getByRole('textbox');

      // Add some content to trigger the layout function
      Object.defineProperty(editor, 'innerText', {
        get: () => 'Debug test content',
        configurable: true,
      });

      fireEvent.input(editor, {
        currentTarget: editor,
      });

      // Use waitFor to allow layout effects to complete
      await waitFor(
        () => {
          expect(debugElement.textContent).toContain('TEXT');
        },
        { timeout: 1000 }
      );

      // Verify comprehensive debug information is present
      expect(debugElement.textContent).toContain('Content Length:');
      expect(debugElement.textContent).toContain('Text Height:');
      expect(debugElement.textContent).toContain('Base Font Size: 18px');
      expect(debugElement.textContent).toContain('Scaled Font Size:');
      expect(debugElement.textContent).toContain('Line Height:');

      expect(debugElement.textContent).toContain('POSITION');
      expect(debugElement.textContent).toContain('Vertical Position: 60%');
      expect(debugElement.textContent).toContain('Padding Top:');
      expect(debugElement.textContent).toContain('Padding Bottom:');
      expect(debugElement.textContent).toContain('Usable Height:');
      expect(debugElement.textContent).toContain('Text Center Y:');
      expect(debugElement.textContent).toContain('Text Fits:');

      expect(debugElement.textContent).toContain('PAPER');
      expect(debugElement.textContent).toContain('Size:');
      expect(debugElement.textContent).toContain('Scale:');

      expect(debugElement.textContent).toContain('DIRECTION');
      expect(debugElement.textContent).toContain('Text Direction: ltr');
      expect(debugElement.textContent).toContain(
        'Unicode Bidi: isolate-override'
      );
      expect(debugElement.textContent).toContain('Computed Direction: ltr');

      // Cleanup
      document.body.removeChild(debugElement);
    });

    it('handles missing debug element gracefully', () => {
      // Don't create debug element
      const debugState = { ...initialState, debugMode: true };

      render(<Editor state={debugState} setState={mockSetState} />);

      const editor = screen.getByRole('textbox');
      fireEvent.input(editor, {
        currentTarget: {
          ...editor,
          innerText: 'Test content',
        },
      });

      // Component should not crash when debug element is missing
      expect(editor).toBeInTheDocument();
    });
  });

  describe('Text Normalization and Selection', () => {
    it('handles input events and calls setState correctly', () => {
      render(<Editor state={initialState} setState={mockSetState} />);

      const editor = screen.getByRole('textbox');

      // Mock sanitizeText to return different content to trigger normalization path
      const mockSanitizeText =
        jest.requireMock('../../utils/layout').sanitizeText;
      mockSanitizeText.mockReturnValueOnce('Normalized content');

      fireEvent.input(editor, {
        currentTarget: {
          innerText: 'Original content<script>',
        },
      });

      // Verify setState was called with normalized content
      expect(mockSetState).toHaveBeenCalledWith({
        ...initialState,
        editorContent: 'Normalized content',
      });
    });

    it('handles input events when content does not need normalization', () => {
      render(<Editor state={initialState} setState={mockSetState} />);

      const editor = screen.getByRole('textbox');

      // Mock sanitizeText to return same content (no normalization)
      const mockSanitizeText =
        jest.requireMock('../../utils/layout').sanitizeText;
      mockSanitizeText.mockReturnValueOnce('Clean content');

      fireEvent.input(editor, {
        currentTarget: {
          innerText: 'Clean content',
        },
      });

      // Verify setState was called correctly
      expect(mockSetState).toHaveBeenCalledWith({
        ...initialState,
        editorContent: 'Clean content',
      });
    });

    it('handles DOM selection and range operations safely', () => {
      const mockSelection = {
        anchorNode: null,
        removeAllRanges: jest.fn(),
        addRange: jest.fn(),
      };
      const mockRange = {
        selectNodeContents: jest.fn(),
        collapse: jest.fn(),
      };

      (document.getSelection as jest.Mock).mockReturnValue(mockSelection);
      (document.createRange as jest.Mock).mockReturnValue(mockRange);

      render(<Editor state={initialState} setState={mockSetState} />);

      const editor = screen.getByRole('textbox');

      // Mock sanitizeText to return the same content as input
      const mockSanitizeText =
        jest.requireMock('../../utils/layout').sanitizeText;
      mockSanitizeText.mockReturnValueOnce('Test content');

      // Just trigger an input event - the component should handle selection safely
      fireEvent.input(editor, {
        currentTarget: {
          innerText: 'Test content',
        },
      });

      // Component should not crash and setState should be called
      expect(mockSetState).toHaveBeenCalledWith({
        ...initialState,
        editorContent: 'Test content',
      });
    });
  });
});
