'use client';

import { useEffect } from 'react';
import { iframePrint } from '@/utils/iframePrint';

/**
 * Component that exposes functions globally for testing purposes
 */
export default function GlobalExports() {
  useEffect(() => {
    // Make iframePrint available globally for tests
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).iframePrint = iframePrint;
    }
  }, []);

  return null; // This component renders nothing
}
