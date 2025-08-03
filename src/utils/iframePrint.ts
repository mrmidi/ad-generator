// src/utils/iframePrint.ts
export type PaperFormat = 'a4-portrait' | 'a4-landscape';

export interface IframePrintOptions {
  paperFormat: PaperFormat;
  editorContent: string;
  /** Set true only if content is trusted HTML; otherwise plain text is used. */
  treatContentAsHTML?: boolean;
  fontFamily?: string; // default bold Roboto like your editor
  fontWeight?: number; // default 700
}

/* Physical A4 size in mm by orientation */
const pageMmHeight = (fmt: PaperFormat) => (fmt === 'a4-landscape' ? 210 : 297);
const pageMmWidth = (fmt: PaperFormat) => (fmt === 'a4-landscape' ? 297 : 210);

/** Compute px→mm using the live paper content height (clientHeight, borderless). */
function computeMmMetrics(format: PaperFormat) {
  const paperEl = document.querySelector('.paper-base') as HTMLElement | null;
  const editorEl = document.querySelector('#editor') as HTMLElement | null;
  if (!paperEl || !editorEl) return null;

  const paperHeightPx = paperEl.clientHeight || 1; // content box only
  const mmPerPx = pageMmHeight(format) / paperHeightPx;

  const cs = getComputedStyle(editorEl);
  const fontPx = parseFloat(cs.fontSize) || 0;

  let linePx = parseFloat(cs.lineHeight);
  if (!linePx || Number.isNaN(linePx)) linePx = Math.round(fontPx * 1.4);

  const padTopPx = parseFloat(cs.paddingTop) || 0;
  const padBottomPx = parseFloat(cs.paddingBottom) || 0;

  return {
    fontMM: fontPx * mmPerPx,
    lineMM: linePx * mmPerPx,
    padTopMM: padTopPx * mmPerPx,
    padBottomMM: padBottomPx * mmPerPx,
  };
}

/** Escape text for safe HTML injection (used when treatContentAsHTML=false) */
function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Print via a hidden, same-origin iframe.
 * No inline <script> (CSP-friendly). Parent triggers print() on the iframe window.
 */
export async function iframePrint(options: IframePrintOptions): Promise<void> {
  const {
    paperFormat,
    editorContent,
    treatContentAsHTML = false,
    fontFamily = `'Roboto', Arial, sans-serif`,
    fontWeight = 700,
  } = options;

  if (!editorContent || editorContent.trim() === '') {
    alert('Пожалуйста, введите текст перед печатью.');
    return;
  }

  const metrics = computeMmMetrics(paperFormat);
  if (!metrics) {
    alert('Не удалось получить редактор/лист для печати.');
    return;
  }

  // Build minimal print CSS (no rotation; correct @page + physical A4 box)
  const css = `
@page { size: ${paperFormat === 'a4-landscape' ? 'A4 landscape' : 'A4 portrait'}; margin: 0; }
html, body { margin: 0; padding: 0; height: 100%; background: #fff; color: #000; }
.paper {
  width: ${pageMmWidth(paperFormat)}mm;
  height: ${pageMmHeight(paperFormat)}mm;
  margin: 0 auto;
  background: #fff;
  position: relative;
  overflow: visible;
  box-sizing: border-box;
}
.editor {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  direction: ltr;
  unicode-bidi: isolate-override;
  white-space: pre-wrap;       /* preserve \\n */
  word-break: break-word;
  overflow-wrap: break-word;
  text-align: center;

  font-family: ${fontFamily};
  font-weight: ${fontWeight};
  font-size: ${metrics.fontMM.toFixed(4)}mm;
  line-height: ${metrics.lineMM.toFixed(4)}mm;
  padding-top: ${metrics.padTopMM.toFixed(4)}mm;
  padding-bottom: ${metrics.padBottomMM.toFixed(4)}mm;
  padding-left: 5%;
  padding-right: 5%;
  background: transparent;
  color: #000;
}
/* Optional on-screen preview in the iframe tab (not used since hidden) */
@media screen {
  body { display: grid; place-items: center; padding: 16px; }
  .paper { box-shadow: 0 8px 32px rgba(0,0,0,.15); border-radius: 8px; }
}
  `.trim();

  // Create hidden iframe
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  iframe.style.left = '-9999px';
  iframe.style.top = '-9999px';
  iframe.setAttribute('aria-hidden', 'true');
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument!;
  doc.open();
  doc.write(
    `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <title>Печать</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>${css}</style>
</head>
<body>
  <div class="paper">
    <div class="editor" id="editor"></div>
  </div>
</body>
</html>`
  );
  doc.close();

  // Wait for iframe DOM to be ready
  await new Promise<void>(resolve => {
    if (iframe.contentWindow?.document.readyState === 'complete')
      return resolve();
    iframe.addEventListener('load', () => resolve(), { once: true });
  });

  // Inject content
  const iDoc = iframe.contentDocument!;
  const iWin = iframe.contentWindow!;
  const iEditor = iDoc.getElementById('editor') as HTMLElement | null;
  if (!iEditor) {
    // Clean up on failure
    iframe.remove();
    alert('Не удалось подготовить содержимое для печати.');
    return;
  }
  if (treatContentAsHTML) iEditor.innerHTML = editorContent;
  else iEditor.innerHTML = escapeHtml(editorContent);

  // Wait for fonts/layout in the iframe, then print
  try {
    await (iDoc as Document & { fonts?: { ready?: Promise<void> } }).fonts
      ?.ready;
  } catch {}
  await new Promise<void>(r =>
    iWin.requestAnimationFrame(() => iWin.requestAnimationFrame(() => r()))
  );

  // Clean up after print finishes (listen on the iframe window)
  const cleanup = () => {
    iWin.removeEventListener('afterprint', cleanup);
    if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
  };
  iWin.addEventListener('afterprint', cleanup, { once: true });

  // Trigger print while user gesture is still "warm"
  iWin.focus();
  try {
    iWin.print();
  } catch (e) {
    console.error('Print failed:', e);
    cleanup();
  }

  // Fallback cleanup (in case afterprint isn't fired)
  setTimeout(cleanup, 5000);
}
