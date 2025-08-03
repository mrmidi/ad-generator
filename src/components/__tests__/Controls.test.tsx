import { render, screen, fireEvent } from '@testing-library/react';
import Controls from '../Controls';
import { initialState } from '@/app/state';

describe('Controls', () => {
  const mockSetState = jest.fn();

  it('renders the debug mode toggle', () => {
    render(<Controls state={initialState} setState={mockSetState} />);

    const debugModeToggle = screen.getByLabelText(/debug mode/i);
    expect(debugModeToggle).toBeInTheDocument();
  });

  it('toggles the debug mode', () => {
    render(<Controls state={initialState} setState={mockSetState} />);

    const debugModeToggle = screen.getByLabelText(/debug mode/i);
    fireEvent.click(debugModeToggle);
    expect(mockSetState).toHaveBeenCalledWith({
      ...initialState,
      debugMode: true,
    });
  });

  it('renders the paper format toggle', () => {
    render(<Controls state={initialState} setState={mockSetState} />);

    const paperFormatLabel = screen.getByText(/ориентация бумаги/i);
    expect(paperFormatLabel).toBeInTheDocument();
  });

  it('changes the paper format', () => {
    render(<Controls state={initialState} setState={mockSetState} />);

    const landscapeButton = screen.getByText(/ландшафт/i);
    fireEvent.click(landscapeButton);
    expect(mockSetState).toHaveBeenCalledWith({
      ...initialState,
      paperFormat: 'a4-landscape',
    });
  });

  it('renders the font size slider', () => {
    render(<Controls state={initialState} setState={mockSetState} />);

    const fontSizeSlider = screen.getByLabelText(/размер шрифта/i);
    expect(fontSizeSlider).toBeInTheDocument();
  });

  it('changes the font size', () => {
    render(<Controls state={initialState} setState={mockSetState} />);

    const fontSizeSlider = screen.getByLabelText(/размер шрифта/i);
    fireEvent.change(fontSizeSlider, { target: { value: '75' } });
    expect(mockSetState).toHaveBeenCalledWith({
      ...initialState,
      fontSize: 75,
    });
  });

  it('renders the vertical position slider', () => {
    render(<Controls state={initialState} setState={mockSetState} />);

    const verticalPositionSlider =
      screen.getByLabelText(/позиция по вертикали/i);
    expect(verticalPositionSlider).toBeInTheDocument();
  });

  it('changes the vertical position', () => {
    render(<Controls state={initialState} setState={mockSetState} />);

    const verticalPositionSlider =
      screen.getByLabelText(/позиция по вертикали/i);
    fireEvent.change(verticalPositionSlider, { target: { value: '25' } });
    expect(mockSetState).toHaveBeenCalledWith({
      ...initialState,
      verticalPosition: 25,
    });
  });

  it('renders the print button', () => {
    render(<Controls state={initialState} setState={mockSetState} />);

    const printButton = screen.getByRole('button', {
      name: /печать/i,
    });
    expect(printButton).toBeInTheDocument();
  });
});
