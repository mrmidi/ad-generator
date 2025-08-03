// tests/iframe-print.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Iframe Print WYSIWYG', () => {
  const EDITOR_CONTENT = 'Line 1\nLine 2\nBig announcement!';

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.paper-base', { timeout: 10000 });

    // Ensure the editor has some content and trigger input logic if needed
    await page.evaluate((text) => {
      const editor = document.querySelector('#editor') as HTMLElement | null;
      if (editor) {
        editor.textContent = text;
        editor.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }, EDITOR_CONTENT);

    // Wait a bit for any layout/state updates
    await page.waitForTimeout(100);
  });

  test('iframe print creates hidden iframe and preserves content', async ({ page }) => {
    // Mock the print function to track if it was called
    await page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).printCalled = false;
      
      // Override print on all windows (including iframes)
      const mockPrint = () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).printCalled = true;
      };
      
      // Override current window print
      window.print = mockPrint;
      
      // Override iframe print when created
      const originalAppendChild = document.body.appendChild;
      document.body.appendChild = function<T extends Node>(child: T): T {
        const result = originalAppendChild.call(this, child);
        if (child instanceof HTMLIFrameElement && child.contentWindow) {
          child.contentWindow.print = mockPrint;
        }
        return result as T;
      };
    });

    // Check initial iframe count
    const initialIframeCount = await page.evaluate(() => document.querySelectorAll('iframe').length);

    // Trigger iframePrint
    await page.evaluate((text) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (typeof (window as any).iframePrint === 'function') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).iframePrint({ 
          paperFormat: 'a4-portrait', 
          editorContent: text 
        });
      }
    }, EDITOR_CONTENT);

    // Wait for iframe to be created and processed
    await page.waitForTimeout(1000);

    // Check that iframe was created
    const newIframeCount = await page.evaluate(() => document.querySelectorAll('iframe').length);
    expect(newIframeCount).toBe(initialIframeCount + 1);

    // Check iframe content
    const iframeContent = await page.evaluate(() => {
      const iframes = document.querySelectorAll('iframe');
      const lastIframe = iframes[iframes.length - 1] as HTMLIFrameElement;
      if (!lastIframe || !lastIframe.contentDocument) return null;
      
      const editor = lastIframe.contentDocument.querySelector('#editor');
      const paper = lastIframe.contentDocument.querySelector('.paper');
      
      return {
        editorText: editor ? editor.textContent : null,
        paperExists: !!paper,
        editorExists: !!editor,
      };
    });

    expect(iframeContent).not.toBeNull();
    expect(iframeContent?.editorText).toBe(EDITOR_CONTENT);
    expect(iframeContent?.paperExists).toBe(true);
    expect(iframeContent?.editorExists).toBe(true);

    // Check that print was called
    const printCalled = await page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (window as any).printCalled;
    });
    expect(printCalled).toBe(true);
  });

  test('iframe print preserves font metrics in mm', async ({ page }) => {
    // Mock print function
    await page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).printCalled = false;
      
      const mockPrint = () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).printCalled = true;
      };
      
      window.print = mockPrint;
      
      const originalAppendChild = document.body.appendChild;
      document.body.appendChild = function<T extends Node>(child: T): T {
        const result = originalAppendChild.call(this, child);
        if (child instanceof HTMLIFrameElement && child.contentWindow) {
          child.contentWindow.print = mockPrint;
        }
        return result as T;
      };
    });

    // Get current screen metrics first
    const screenMetrics = await page.evaluate(() => {
      const paperEl = document.querySelector('.paper-base') as HTMLElement;
      const editorEl = document.querySelector('#editor') as HTMLElement;
      if (!paperEl || !editorEl) return null;

      const cs = getComputedStyle(editorEl);
      const paperHeightPx = paperEl.clientHeight || 1;
      const mmPerPx = 297 / paperHeightPx; // portrait

      return {
        fontPx: parseFloat(cs.fontSize) || 0,
        expectedFontMM: (parseFloat(cs.fontSize) || 0) * mmPerPx,
        paperHeightPx,
        mmPerPx,
      };
    });

    expect(screenMetrics).not.toBeNull();
    if (!screenMetrics) return;

    // Trigger print
    await page.evaluate((text) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (typeof (window as any).iframePrint === 'function') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).iframePrint({ 
          paperFormat: 'a4-portrait', 
          editorContent: text 
        });
      }
    }, EDITOR_CONTENT);

    await page.waitForTimeout(500);

    // Check font size in iframe by looking at the CSS text
    const iframeMetrics = await page.evaluate(() => {
      const iframes = document.querySelectorAll('iframe');
      const lastIframe = iframes[iframes.length - 1] as HTMLIFrameElement;
      if (!lastIframe || !lastIframe.contentDocument) return null;
      
      // Get the CSS text from the style element
      const styleElement = lastIframe.contentDocument.querySelector('style');
      const cssText = styleElement ? styleElement.textContent : '';
      
      // Extract font-size from CSS text using regex
      const fontSizeMatch = cssText.match(/font-size:\s*([^;]+);/);
      const lineHeightMatch = cssText.match(/line-height:\s*([^;]+);/);
      
      return {
        cssText: cssText.substring(0, 200), // First 200 chars for debugging
        fontSizeMM: fontSizeMatch ? fontSizeMatch[1].trim() : '',
        lineHeightMM: lineHeightMatch ? lineHeightMatch[1].trim() : '',
      };
    });

    expect(iframeMetrics).not.toBeNull();
    if (!iframeMetrics) return;

    // The font size from CSS should be in mm
    expect(iframeMetrics.fontSizeMM).toMatch(/mm$/);
    const fontMM = parseFloat(iframeMetrics.fontSizeMM.replace('mm', ''));
    
    // Allow some tolerance due to rounding
    expect(Math.abs(fontMM - screenMetrics.expectedFontMM)).toBeLessThan(0.5);
  });

  test('iframe print landscape orientation', async ({ page }) => {
    // Switch to landscape first
    const landscapeButton = page.locator('button:has-text("📄 Ландшафт")');
    await landscapeButton.click();
    await page.waitForTimeout(100);

    // Mock print function
    await page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).printCalled = false;
      
      const mockPrint = () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).printCalled = true;
      };
      
      window.print = mockPrint;
      
      const originalAppendChild = document.body.appendChild;
      document.body.appendChild = function<T extends Node>(child: T): T {
        const result = originalAppendChild.call(this, child);
        if (child instanceof HTMLIFrameElement && child.contentWindow) {
          child.contentWindow.print = mockPrint;
        }
        return result as T;
      };
    });

    // Trigger print with landscape
    await page.evaluate((text) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (typeof (window as any).iframePrint === 'function') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).iframePrint({ 
          paperFormat: 'a4-landscape', 
          editorContent: text 
        });
      }
    }, EDITOR_CONTENT);

    await page.waitForTimeout(500);

    // Check paper dimensions and @page rule by examining CSS text
    const dims = await page.evaluate(() => {
      const iframes = document.querySelectorAll('iframe');
      const lastIframe = iframes[iframes.length - 1] as HTMLIFrameElement;
      if (!lastIframe || !lastIframe.contentDocument) return null;
      
      // Get the CSS text from the style element
      const styleElement = lastIframe.contentDocument.querySelector('style');
      const cssText = styleElement ? styleElement.textContent : '';
      
      // Extract dimensions from CSS text using regex
      const paperWidthMatch = cssText.match(/\.paper\s*{[^}]*width:\s*([^;]+);/);
      const paperHeightMatch = cssText.match(/\.paper\s*{[^}]*height:\s*([^;]+);/);
      const pageRuleMatch = cssText.match(/@page\s*{\s*size:\s*([^;]+);/);
      
      return {
        paperWidthMM: paperWidthMatch ? paperWidthMatch[1].trim() : '',
        paperHeightMM: paperHeightMatch ? paperHeightMatch[1].trim() : '',
        pageRule: pageRuleMatch ? pageRuleMatch[1].trim() : '',
        cssText: cssText.substring(0, 500), // For debugging
      };
    });

    expect(dims).not.toBeNull();
    // Paper should be landscape dimensions (297mm x 210mm)
    expect(dims?.paperWidthMM).toBe('297mm');
    expect(dims?.paperHeightMM).toBe('210mm');
    // @page rule should specify landscape
    expect(dims?.pageRule).toBe('A4 landscape');
  });

  test('iframe print handles empty content gracefully', async ({ page }) => {
    // Stub alert to capture it
    let alertMessage = '';
    await page.evaluate(() => {
      window.alert = (msg) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).lastAlert = msg;
      };
    });

    // Try to print with empty content
    await page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (typeof (window as any).iframePrint === 'function') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).iframePrint({ 
          paperFormat: 'a4-portrait', 
          editorContent: '' 
        });
      }
    });

    // Check that alert was called
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    alertMessage = await page.evaluate(() => (window as any).lastAlert);
    expect(alertMessage).toBe('Пожалуйста, введите текст перед печатью.');
  });

  test('iframe print cleans up after timeout', async ({ page }) => {
    // Mock print function
    await page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).printCalled = false;
      
      const mockPrint = () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).printCalled = true;
      };
      
      window.print = mockPrint;
      
      const originalAppendChild = document.body.appendChild;
      document.body.appendChild = function<T extends Node>(child: T): T {
        const result = originalAppendChild.call(this, child);
        if (child instanceof HTMLIFrameElement && child.contentWindow) {
          child.contentWindow.print = mockPrint;
        }
        return result as T;
      };
    });

    const initialIframeCount = await page.evaluate(() => document.querySelectorAll('iframe').length);

    // Trigger print
    await page.evaluate((text) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (typeof (window as any).iframePrint === 'function') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).iframePrint({ 
          paperFormat: 'a4-portrait', 
          editorContent: text 
        });
      }
    }, EDITOR_CONTENT);

    // Wait for iframe creation
    await page.waitForTimeout(500);
    
    // Should have new iframe
    let iframeCount = await page.evaluate(() => document.querySelectorAll('iframe').length);
    expect(iframeCount).toBe(initialIframeCount + 1);

    // Wait for cleanup timeout (5 seconds + some buffer)
    await page.waitForTimeout(6000);

    // Should be cleaned up
    iframeCount = await page.evaluate(() => document.querySelectorAll('iframe').length);
    expect(iframeCount).toBe(initialIframeCount);
  });
});
