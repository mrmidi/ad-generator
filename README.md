# Ad Generator - Announcement PDF Creator

A modern web application for creating and exporting text-based announcements as PDF files. Built with Next.js, React, TypeScript, and Tailwind CSS using Test-Driven Development (TDD).

## Features

- **Rich Text Editing**: Content-editable interface with LTR enforcement and newline support
- **Paper Format Selection**: A4 Portrait and Landscape orientations
- **Dynamic Font Scaling**: Responsive font sizing based on paper dimensions
- **Vertical Text Positioning**: Edge-anchored positioning with overflow protection
- **PDF Export**: High-quality PDF generation using html2canvas and jsPDF
- **Debug Mode**: Comprehensive layout and positioning diagnostics
- **Responsive Design**: Optimized for desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

### Development

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

### Building for Production

```bash
npm run build
npm start
```

## Testing

The project uses comprehensive Test-Driven Development (TDD) with both unit and end-to-end tests.

### Unit Tests (Jest)

```bash
npm test
```

Tests include:
- Component functionality (Controls, Editor, Debug, Header)
- Utility functions (layout calculations, text positioning)
- State management

### End-to-End Tests (Playwright)

```bash
npm run test:e2e
```

E2E tests verify:
- Text direction enforcement (LTR)
- Multi-line text handling
- Vertical positioning accuracy
- Paper dimension stability
- Font scaling across orientations
- PDF export functionality

### Test UI (Development)

```bash
npm run test:e2e:ui
```

## Architecture

### Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **PDF Generation**: jsPDF + html2canvas
- **Testing**: Jest (unit), Playwright (E2E)
- **Linting**: ESLint with Next.js config

### Project Structure

```
src/
├── app/
│   ├── globals.css          # Global styles and CSS variables
│   ├── layout.tsx           # Root layout component
│   ├── page.tsx             # Main application page
│   └── state.ts             # Application state interface
├── components/
│   ├── Controls.tsx         # Left sidebar controls
│   ├── Debug.tsx            # Debug information panel
│   ├── Editor.tsx           # Main text editor component
│   └── Header.tsx           # Application header
└── utils/
    ├── layout.ts            # Core layout and positioning utilities
    └── pdfExport.ts         # PDF generation functionality
```

### Key Design Principles

1. **DOM as Source of Truth**: No `dangerouslySetInnerHTML`, DOM drives content state
2. **Strict LTR Enforcement**: `unicode-bidi: isolate-override` prevents RTL issues
3. **Edge-Anchored Positioning**: 0% = top edge, 100% = bottom edge with clamping
4. **Deterministic Updates**: ResizeObserver + requestAnimationFrame (no setTimeout)
5. **Accurate Measurement**: Hidden DOM probes for precise text height calculation

## Features in Detail

### Text Direction
- Enforces left-to-right (LTR) text direction regardless of input content
- Strips bidirectional control characters on input/paste
- Preserves visual order for mixed scripts (English, Cyrillic, digits, currency)

### Vertical Positioning
- Edge-anchored slider: 0% aligns text top with usable area top, 100% aligns text bottom with usable area bottom
- Automatic clamping prevents text overflow
- Dynamic padding calculation based on measured text height

### Font Scaling
- Proportional scaling based on paper dimensions
- Maintains readability with minimum/maximum font size limits
- Consistent scaling across orientation changes

### PDF Export
- Pixel-perfect PDF generation matching screen appearance
- Proper A4 dimensions (210×297mm portrait, 297×210mm landscape)
- High-quality rendering with 2x scale factor

## Development Notes

### Code Style
- TypeScript strict mode enabled
- ESLint with Next.js core web vitals rules
- Functional components with hooks
- Comprehensive type definitions

### Performance
- ResizeObserver for efficient layout updates
- requestAnimationFrame for smooth animations
- Debounced text height measurements
- Minimal re-renders through careful dependency management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

This project is private and proprietary.

## Migration Notes

This application was refactored from a vanilla JavaScript implementation (see `/backup/` folder) to a modern React/Next.js stack while maintaining all original functionality and improving performance, maintainability, and user experience.
