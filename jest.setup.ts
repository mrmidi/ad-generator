import '@testing-library/jest-dom';

// Simple polyfills for Jest environment
Object.defineProperty(global, 'alert', {
  value: () => {},
  writable: true,
});

Object.defineProperty(global, 'ResizeObserver', {
  value: class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
  writable: true,
});

Object.defineProperty(global, 'requestAnimationFrame', {
  value: (cb: () => void) => {
    setTimeout(cb, 0);
    return 1;
  },
  writable: true,
});

Object.defineProperty(global, 'cancelAnimationFrame', {
  value: () => {},
  writable: true,
});
