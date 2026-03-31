// Body shape SVG generators for the creature field guide system.
// Each returns an SVG path string for the body outline.

import type { BodyShape } from '../../engine/types';

export function getBodyTemplate(shape: BodyShape, size: number): string {
  const cx = size / 2;
  const cy = size / 2;
  const s = size * 0.4; // scale factor

  switch (shape) {
    case 'humanoid':
      return humanoidPath(cx, cy, s);
    case 'arachnid':
      return arachnidPath(cx, cy, s);
    case 'serpentine':
      return serpentinePath(cx, cy, s);
    case 'amorphous':
      return amorphousPath(cx, cy, s);
    case 'winged':
      return wingedPath(cx, cy, s);
  }
}

function humanoidPath(cx: number, cy: number, s: number): string {
  return `
    <circle cx="${cx}" cy="${cy - s * 0.8}" r="${s * 0.25}" fill="none" stroke="currentColor" />
    <line x1="${cx}" y1="${cy - s * 0.55}" x2="${cx}" y2="${cy + s * 0.3}" stroke="currentColor" />
    <line x1="${cx - s * 0.45}" y1="${cy - s * 0.2}" x2="${cx + s * 0.45}" y2="${cy - s * 0.2}" stroke="currentColor" />
    <line x1="${cx}" y1="${cy + s * 0.3}" x2="${cx - s * 0.3}" y2="${cy + s * 0.9}" stroke="currentColor" />
    <line x1="${cx}" y1="${cy + s * 0.3}" x2="${cx + s * 0.3}" y2="${cy + s * 0.9}" stroke="currentColor" />
  `;
}

function arachnidPath(cx: number, cy: number, s: number): string {
  const legs = Array.from({ length: 4 }, (_, i) => {
    const yOff = (i - 1.5) * s * 0.2;
    return `
      <line x1="${cx - s * 0.3}" y1="${cy + yOff}" x2="${cx - s * 0.8}" y2="${cy + yOff - s * 0.2}" stroke="currentColor" />
      <line x1="${cx + s * 0.3}" y1="${cy + yOff}" x2="${cx + s * 0.8}" y2="${cy + yOff - s * 0.2}" stroke="currentColor" />
    `;
  }).join('');

  return `
    <ellipse cx="${cx}" cy="${cy}" rx="${s * 0.35}" ry="${s * 0.25}" fill="none" stroke="currentColor" />
    <ellipse cx="${cx}" cy="${cy - s * 0.35}" rx="${s * 0.2}" ry="${s * 0.15}" fill="none" stroke="currentColor" />
    ${legs}
  `;
}

function serpentinePath(cx: number, cy: number, s: number): string {
  return `
    <path d="M ${cx - s * 0.4} ${cy + s * 0.6}
             C ${cx - s * 0.6} ${cy} ${cx + s * 0.6} ${cy} ${cx} ${cy - s * 0.4}
             C ${cx - s * 0.2} ${cy - s * 0.6} ${cx + s * 0.2} ${cy - s * 0.8} ${cx + s * 0.3} ${cy - s * 0.7}"
          fill="none" stroke="currentColor" />
    <circle cx="${cx + s * 0.3}" cy="${cy - s * 0.7}" r="${s * 0.1}" fill="none" stroke="currentColor" />
  `;
}

function amorphousPath(cx: number, cy: number, s: number): string {
  return `
    <path d="M ${cx - s * 0.4} ${cy + s * 0.3}
             C ${cx - s * 0.6} ${cy - s * 0.1} ${cx - s * 0.2} ${cy - s * 0.6} ${cx} ${cy - s * 0.5}
             C ${cx + s * 0.25} ${cy - s * 0.6} ${cx + s * 0.6} ${cy - s * 0.1} ${cx + s * 0.4} ${cy + s * 0.3}
             C ${cx + s * 0.2} ${cy + s * 0.5} ${cx - s * 0.2} ${cy + s * 0.5} ${cx - s * 0.4} ${cy + s * 0.3} Z"
          fill="none" stroke="currentColor" />
  `;
}

function wingedPath(cx: number, cy: number, s: number): string {
  return `
    <ellipse cx="${cx}" cy="${cy}" rx="${s * 0.15}" ry="${s * 0.35}" fill="none" stroke="currentColor" />
    <path d="M ${cx - s * 0.15} ${cy - s * 0.15}
             C ${cx - s * 0.7} ${cy - s * 0.7} ${cx - s * 0.9} ${cy} ${cx - s * 0.25} ${cy + s * 0.15}"
          fill="none" stroke="currentColor" />
    <path d="M ${cx + s * 0.15} ${cy - s * 0.15}
             C ${cx + s * 0.7} ${cy - s * 0.7} ${cx + s * 0.9} ${cy} ${cx + s * 0.25} ${cy + s * 0.15}"
          fill="none" stroke="currentColor" />
  `;
}
