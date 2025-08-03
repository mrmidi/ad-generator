// src/utils/layout.ts

export type PaperFormat = 'a4-portrait' | 'a4-landscape';

export interface PaperDimensions {
  width: number;
  height: number;
  aspectRatio: number;
}

export interface ContainerDimensions {
  width: number;
  height: number;
}

export interface ScaledDimensions {
  width: number;
  height: number;
  scale: number;
}

const A4 = {
  PORTRAIT: { width: 210, height: 297, aspectRatio: 210 / 297 },
  LANDSCAPE: { width: 297, height: 210, aspectRatio: 297 / 210 },
} as const;

/**
 * Returns the canonical A4 dimensions (in mm) for the given format.
 */
export function getA4Dimensions(format: PaperFormat): PaperDimensions {
  return format === 'a4-portrait' ? A4.PORTRAIT : A4.LANDSCAPE;
}

/**
 * Fit the paper into a container while preserving aspect ratio.
 * maxScale allows leaving padding around it.
 */
export function calculateOptimalPaperSize(
  container: ContainerDimensions,
  format: PaperFormat,
  maxScale = 0.95
): ScaledDimensions {
  const paper = getA4Dimensions(format);
  const availableWidth = container.width * maxScale;
  const availableHeight = container.height * maxScale;
  const scaleX = availableWidth / paper.width;
  const scaleY = availableHeight / paper.height;
  const scale = Math.min(scaleX, scaleY);
  return {
    width: paper.width * scale,
    height: paper.height * scale,
    scale
  };
}

/**
 * Font scaling with reasonable bounds and line-height for readability & PDF descender clearance.
 */
export function calculateScaledFont(
  basePx: number,
  paperScale: number,
  maxPx = 120,
  minPx = 8
): { fontSizePx: number; lineHeightPx: number } {
  const px = Math.max(minPx, Math.min(maxPx, basePx * paperScale));
  const lineHeight = Math.round(px * 1.4);
  return { fontSizePx: px, lineHeightPx: lineHeight };
}

/**
 * Edge-anchored vertical positioning: 0% => top edge of usable area, 100% => bottom.
 */
export function calculateVerticalTextPosition(
  containerHeight: number,
  verticalPositionPercent: number,
  textHeight: number,
  paddingRatio = 0.05
): {
  paddingTop: number;
  paddingBottom: number;
  usableHeight: number;
  textCenterY: number;
} {
  const basePadding = containerHeight * paddingRatio;
  const usable = Math.max(0, containerHeight - 2 * basePadding);
  const clampedTextHeight = Math.min(textHeight, usable);
  const positionRatio = Math.max(0, Math.min(1, verticalPositionPercent / 100));
  const slideRange = Math.max(0, usable - clampedTextHeight);
  const topWithin = positionRatio * slideRange;

  const paddingTop = basePadding + topWithin;
  const paddingBottom = basePadding + (usable - clampedTextHeight - topWithin);
  const textCenterY = paddingTop + clampedTextHeight / 2;

  return {
    paddingTop,
    paddingBottom,
    usableHeight: usable,
    textCenterY
  };
}

/**
 * Returns the unscaled height of an element (ignores CSS transforms like scale).
 */
export function getUnscaledHeight(el: HTMLElement): number {
  return el.clientHeight;
}

/**
 * Hidden DOM probe to measure multi-line text height exactly given current typography.
 */
export function measureTextHeightWithProbe(
  text: string,
  referenceEl: HTMLElement,
  fontSizePx: number,
  lineHeightPx: number
): number {
  const probe = document.createElement('div');
  const cs = getComputedStyle(referenceEl);

  probe.textContent = text || '';
  probe.style.position = 'absolute';
  probe.style.visibility = 'hidden';
  probe.style.pointerEvents = 'none';
  probe.style.whiteSpace = 'pre-wrap';
  probe.style.wordBreak = cs.wordBreak || 'break-word';
  probe.style.overflowWrap = cs.overflowWrap || 'break-word';
  probe.style.boxSizing = 'border-box';
  probe.style.width = `${referenceEl.clientWidth}px`;

  probe.style.fontFamily = cs.fontFamily;
  probe.style.fontWeight = cs.fontWeight;
  probe.style.letterSpacing = cs.letterSpacing;
  probe.style.direction = 'ltr';
  probe.style.unicodeBidi = 'isolate-override';
  probe.style.fontSize = `${fontSizePx}px`;
  probe.style.lineHeight = `${lineHeightPx}px`;
  probe.style.paddingLeft = cs.paddingLeft;
  probe.style.paddingRight = cs.paddingRight;

  document.body.appendChild(probe);
  const measured = Math.ceil(probe.scrollHeight);
  document.body.removeChild(probe);

  return Math.max(measured, lineHeightPx);
}

/**
 * Regex for stripping bidi control characters.
 */
export const STRIP_BIDI = /[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g;

/**
 * Clean incoming text: remove bidi controls and normalize.
 */
export function sanitizeText(input: string): string {
  return (input || '').replace(STRIP_BIDI, '').normalize('NFC');
}