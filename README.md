# Ad Generator - Announcement Creator 🖨️

[![CI/CD Pipeline](https://github.com/mrmidi/ad-generator/actions/workflows/ci.yml/badge.svg)](https://github.com/mrmidi/ad-generator/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)

A modern web application for creating and printing text-based announcements with WYSIWYG accuracy. Built with Next.js, React, TypeScript, and Tailwind CSS using Test-Driven Development (TDD).

🔗 **Repository**: https://github.com/mrmidi/ad-generator

## 📊 Current Status

- ✅ **Core Functionality**: Complete iframe-based WYSIWYG printing
- ✅ **Testing**: 100% test coverage with Jest + Playwright
- ✅ **CI/CD**: Automated testing, linting, and deployment pipelines
- ✅ **Documentation**: Comprehensive README and issue templates
- ✅ **Open Source**: MIT licensed for community contributions
- 🚀 **Production Ready**: Built and deployed with Next.js 15

## ✨ Features

- **📝 Rich Text Editing**: Content-editable interface with LTR enforcement and newline support
- **📄 Paper Format Selection**: A4 Portrait and Landscape orientations
- **🔍 Dynamic Font Scaling**: Responsive font sizing based on paper dimensions
- **↕️ Vertical Text Positioning**: Edge-anchored positioning with overflow protection
- **🖨️ WYSIWYG Printing**: High-accuracy iframe-based printing with proper A4 dimensions
- **🔧 Debug Mode**: Comprehensive layout and positioning diagnostics
- **📱 Responsive Design**: Optimized for desktop and mobile devices
- **🌐 Russian Localization**: Full Russian UI with Cyrillic font support

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm (or yarn/pnpm/bun)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd ad-generator
```

2. Install dependencies:

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

### Building for Production

```bash
npm run build
npm start
```

## 🧪 Testing

The project uses comprehensive Test-Driven Development (TDD) with both unit and end-to-end tests.

### Unit Tests (Jest)

```bash
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage report
```

Tests include:

- Component functionality (Controls, Editor, Debug, Header)
- Utility functions (layout calculations, iframe printing)
- State management

### End-to-End Tests (Playwright)

```bash
npm run test:e2e         # Headless mode
npm run test:e2e:ui      # Interactive UI mode
npm run test:e2e:headed  # Headed browser mode
```

E2E tests verify:

- Iframe print functionality and WYSIWYG accuracy
- Paper dimension calculations (A4 portrait/landscape)
- Text positioning and font scaling
- Print metrics conversion (px to mm)
- Content preservation during print operations

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript 5
- **Styling**: Tailwind CSS 4
- **Printing**: Custom iframe-based solution with mm conversion
- **Testing**: Jest (unit), Playwright (E2E)
- **Linting**: ESLint + Prettier
- **CI/CD**: GitHub Actions

### Project Structure

```
src/
├── app/
│   ├── globals.css          # Global styles and CSS variables
│   ├── layout.tsx           # Root layout with fonts
│   ├── page.tsx             # Main application page
│   └── state.ts             # Application state interface
├── components/
│   ├── Controls.tsx         # Left sidebar controls
│   ├── Debug.tsx            # Debug information panel
│   ├── Editor.tsx           # Main text editor component
│   ├── Header.tsx           # Application header
│   └── GlobalExports.tsx    # Global function exports for testing
└── utils/
    ├── layout.ts            # Core layout and positioning utilities
    └── iframePrint.ts       # Iframe-based printing functionality
```

## 🖨️ Print Technology

### Iframe Print Solution

- **CSP-Friendly**: No inline scripts, compliant with Content Security Policy
- **WYSIWYG Accuracy**: Pixel-perfect print output matching screen appearance
- **Proper A4 Dimensions**: 210×297mm (portrait) and 297×210mm (landscape)
- **mm-Based Font Conversion**: Accurate px→mm conversion using browser metrics
- **Content Preservation**: Maintains all styling and positioning during print

### Key Technical Features

1. **Hidden Iframe Approach**: Creates isolated print context without popup blockers
2. **@page CSS Rules**: Proper paper size control via CSS
3. **Font Metrics Calculation**: Runtime px→mm conversion for WYSIWYG accuracy
4. **Cleanup Management**: Automatic iframe removal after print completion

## 🎯 Key Design Principles

1. **DOM as Source of Truth**: No `dangerouslySetInnerHTML`, DOM drives content state
2. **Strict LTR Enforcement**: `unicode-bidi: isolate-override` prevents RTL issues
3. **Edge-Anchored Positioning**: 0% = top edge, 100% = bottom edge with clamping
4. **Deterministic Updates**: ResizeObserver + requestAnimationFrame (no setTimeout)
5. **Accurate Measurement**: Hidden DOM probes for precise text height calculation
6. **Print-First Design**: All measurements in mm for consistent print output

## 📋 Available Scripts

```bash
npm run dev              # Development server
npm run build            # Production build
npm start                # Start production server
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
npm test                 # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage
npm run test:e2e         # Run E2E tests
npm run test:e2e:ui      # Run E2E tests with UI
npm run export           # Build for static export
npm run type-check       # TypeScript type checking
```

## 🔧 Development

### Code Style

- TypeScript strict mode enabled
- ESLint with Next.js configuration
- Prettier for code formatting
- Comprehensive type definitions

### Performance

- ResizeObserver for efficient layout updates
- requestAnimationFrame for smooth animations
- Debounced text height measurements
- Minimal re-renders through careful dependency management

### Testing Strategy

- **Unit Tests**: Component logic and utilities
- **Integration Tests**: Component interactions
- **E2E Tests**: Full print workflow validation
- **Visual Tests**: WYSIWYG print accuracy

## 🚀 CI/CD Pipeline

The project includes comprehensive GitHub Actions workflows:

- **Linting & Formatting**: ESLint and Prettier checks
- **Unit Testing**: Jest with coverage reporting
- **E2E Testing**: Playwright browser automation
- **Security Auditing**: Dependency vulnerability scanning
- **Build Verification**: Production build validation
- **VPS Deployment**: Automated deployment to mrmidi.net

## 🚀 Production Deployment

### Live Site

- **URL**: <https://ad-generator.mrmidi.net>
- **Auto-deployment**: Pushes to `main` branch trigger deployment
- **Infrastructure**: Debian 12 + Nginx + Let's Encrypt SSL
- **Performance**: Static files served via Nginx with caching

### 🔧 VPS Deployment Setup

1. **Run VPS setup** (one-time):

   ```bash
   sudo bash setup-vps.sh
   ```

2. **Configure GitHub secrets**:
   - `VPS_SSH_KEY`: SSH private key for deployment
   - `VPS_HOST`: Server IP or domain (mrmidi.net)
   - `VPS_USER`: Deploy user (deploy)
   - `VPS_TARGET_PATH`: Web directory path

3. **Deployment happens automatically** on git push to main

See `setup-github-secrets.md` for detailed setup instructions.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for new functionality
4. Ensure all tests pass (`npm test && npm run test:e2e`)
5. Run linting (`npm run lint && npm run format:check`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### MIT License Summary

- ✅ **Commercial use** - You can use this software commercially
- ✅ **Modification** - You can modify the source code
- ✅ **Distribution** - You can distribute the software
- ✅ **Private use** - You can use this software privately
- ℹ️ **License and copyright notice** - Include the original license and copyright notice
- ❌ **Warranty** - The software is provided "as is" without warranty

## 🔄 Migration Notes

This application evolved through multiple iterations:

1. **Vanilla JS** (see `/backup/` folder) - Original implementation
2. **React/Next.js** - Modern framework migration
3. **Print CSS** - Initial print functionality
4. **Iframe Solution** - Current WYSIWYG print implementation

Each iteration maintained functionality while improving performance, maintainability, and print accuracy.
