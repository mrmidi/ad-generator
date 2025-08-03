import { useEffect, useRef, useCallback } from 'react';
import {
  calculateOptimalPaperSize,
  calculateScaledFont,
  calculateVerticalTextPosition,
  getUnscaledHeight,
  measureTextHeightWithProbe,
  sanitizeText,
} from '@/utils/layout';
import type { AppState } from '@/app/state';

interface EditorProps {
  state: AppState;
  setState: (state: AppState) => void;
}

export default function Editor({ state, setState }: EditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const roRef = useRef<ResizeObserver | null>(null);
  const rafRef = useRef<number | null>(null);

  /** Apply paper dimensions based on container size */
  const applyPaperSize = useCallback(() => {
    if (!containerRef.current || !paperRef.current) return null;
    const containerRect = containerRef.current.getBoundingClientRect();
    const avail = {
      width: containerRect.width - 40,
      height: containerRect.height - 40,
    };
    const paper = calculateOptimalPaperSize(avail, state.paperFormat, 0.95);

    const paperEl = paperRef.current;
    paperEl.style.width = `${paper.width}px`;
    paperEl.style.height = `${paper.height}px`;
    paperEl.style.minWidth = `${paper.width}px`;
    paperEl.style.minHeight = `${paper.height}px`;
    paperEl.style.maxWidth = `${paper.width}px`;
    paperEl.style.maxHeight = `${paper.height}px`;
    return paper;
  }, [state.paperFormat]);

  /** Layout pass: font, measurement, vertical padding */
  const layout = useCallback(() => {
    if (!editorRef.current || !paperRef.current) return;

    // Always run after paper size is set
    const paper = applyPaperSize() || {
      width: paperRef.current.clientWidth,
      height: paperRef.current.clientHeight,
      scale: 1,
    };
    const editor = editorRef.current;
    const paperHeight = getUnscaledHeight(paperRef.current);

    const { fontSizePx, lineHeightPx } = calculateScaledFont(
      state.fontSize,
      paper.scale
    );
    editor.style.fontSize = `${fontSizePx}px`;
    editor.style.lineHeight = `${lineHeightPx}px`;

    // Measure text height using a probe with current width/typography
    const content = sanitizeText(editor.innerText);
    const textHeight = measureTextHeightWithProbe(
      content,
      editor,
      fontSizePx,
      lineHeightPx
    );

    // Edge-anchored, clamped vertical position
    const vp = calculateVerticalTextPosition(
      paperHeight,
      state.verticalPosition,
      textHeight,
      0.05
    );

    // Round padding values to prevent subpixel clipping in PDF
    const paddingTop = Math.ceil(vp.paddingTop);
    const paddingBottom = Math.ceil(vp.paddingBottom);

    editor.style.paddingTop = `${paddingTop}px`;
    editor.style.paddingBottom = `${paddingBottom}px`;

    if (state.debugMode) {
      const dbg = document.getElementById('debugMessages');
      if (dbg) {
        dbg.textContent = `TEXT
Content Length: ${content.length} chars
Text Height: ${textHeight.toFixed(1)}px
Base Font Size: ${state.fontSize}px
Scaled Font Size: ${fontSizePx.toFixed(1)}px
Line Height: ${lineHeightPx.toFixed(1)}px

POSITION
Vertical Position: ${state.verticalPosition}%
Padding Top: ${paddingTop.toFixed(1)}px
Padding Bottom: ${paddingBottom.toFixed(1)}px
Usable Height: ${vp.usableHeight.toFixed(1)}px
Text Center Y: ${vp.textCenterY.toFixed(1)}px
Text Fits: ${textHeight <= vp.usableHeight ? 'YES' : 'NO (CLAMPED)'}

PAPER
Size: ${paper.width.toFixed(0)}×${paper.height.toFixed(0)} px
Scale: ${paper.scale.toFixed(3)}

DIRECTION
Text Direction: ltr
Unicode Bidi: isolate-override
Computed Direction: ${getComputedStyle(editor).direction}`;
      }
    }
  }, [state.fontSize, state.verticalPosition, state.debugMode, applyPaperSize]);

  /** Schedule a layout on next frame (coalesce bursts) */
  const scheduleLayout = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      layout();
    });
  }, [layout]);

  /** Initialize ResizeObserver on mount */
  useEffect(() => {
    if (!containerRef.current) return;
    roRef.current = new ResizeObserver(() => scheduleLayout());
    roRef.current.observe(containerRef.current);
    return () => {
      roRef.current?.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [scheduleLayout]);

  /** Reflect external state.editorContent into DOM only when needed */
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    const sanitized = sanitizeText(state.editorContent);
    // Only set if diverged (avoid clobbering selection)
    if (sanitized !== el.innerText) {
      el.textContent = sanitized;
    }
    scheduleLayout();
  }, [state.editorContent, scheduleLayout]);

  /** Update on changes that affect layout */
  useEffect(() => {
    scheduleLayout();
  }, [
    state.fontSize,
    state.verticalPosition,
    state.paperFormat,
    scheduleLayout,
  ]);

  return (
    <div ref={containerRef} className="paper-container">
      <div className="relative">
        <div
          ref={paperRef}
          className={`paper-base ${state.paperFormat} border-2 border-gray-300 hover:shadow-xl transition-shadow duration-300`}
        >
          <div
            id="editor"
            ref={editorRef}
            contentEditable
            role="textbox"
            dir="ltr"
            data-placeholder="Все по 100 ₽"
            onInput={e => {
              const raw = e.currentTarget.innerText; // keeps \n
              const cleaned = sanitizeText(raw);
              if (cleaned !== raw) {
                // normalize DOM without re-render churn
                const sel = document.getSelection();
                const anchorNode = sel?.anchorNode || null;
                e.currentTarget.textContent = cleaned;
                // best-effort: if selection lost, set to end
                if (!anchorNode) {
                  const r = document.createRange();
                  r.selectNodeContents(e.currentTarget);
                  r.collapse(false);
                  sel?.removeAllRanges();
                  sel?.addRange(r);
                }
              }
              setState({ ...state, editorContent: cleaned });
              scheduleLayout();
            }}
            onPaste={e => {
              e.preventDefault();
              const text = e.clipboardData?.getData('text/plain') || '';
              const cleaned = sanitizeText(text);
              document.execCommand('insertText', false, cleaned);
              const now = sanitizeText(e.currentTarget.innerText);
              setState({ ...state, editorContent: now });
              scheduleLayout();
            }}
          />
        </div>
        {/* Paper format indicator */}
        <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full shadow-md">
          {state.paperFormat === 'a4-portrait'
            ? '📄 A4 Portrait'
            : '📄 A4 Landscape'}
        </div>
      </div>
    </div>
  );
}
