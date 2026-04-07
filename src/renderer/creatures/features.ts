// Feature overlay SVG generators — horns, fangs, claws, wings, markings, etc.

export function getFeatureOverlay(feature: string, size: number): string {
  const cx = size / 2;
  const cy = size / 2;
  const s = size * 0.4;

  switch (feature) {
    case 'horns':
      return `
        <line x1="${cx - s * 0.15}" y1="${cy - s * 0.7}" x2="${cx - s * 0.35}" y2="${cy - s * 1.1}" stroke="currentColor" stroke-opacity="0.95" />
        <line x1="${cx + s * 0.15}" y1="${cy - s * 0.7}" x2="${cx + s * 0.35}" y2="${cy - s * 1.1}" stroke="currentColor" stroke-opacity="0.95" />
      `;
    case 'fangs':
      return `
        <line x1="${cx - s * 0.08}" y1="${cy - s * 0.45}" x2="${cx - s * 0.1}" y2="${cy - s * 0.3}" stroke="currentColor" stroke-opacity="0.95" />
        <line x1="${cx + s * 0.08}" y1="${cy - s * 0.45}" x2="${cx + s * 0.1}" y2="${cy - s * 0.3}" stroke="currentColor" stroke-opacity="0.95" />
      `;
    case 'claws':
      return `
        <line x1="${cx - s * 0.5}" y1="${cy - s * 0.15}" x2="${cx - s * 0.65}" y2="${cy - s * 0.3}" stroke="currentColor" stroke-width="1" />
        <line x1="${cx - s * 0.5}" y1="${cy - s * 0.1}" x2="${cx - s * 0.63}" y2="${cy - s * 0.2}" stroke="currentColor" stroke-width="1" />
        <line x1="${cx + s * 0.5}" y1="${cy - s * 0.15}" x2="${cx + s * 0.65}" y2="${cy - s * 0.3}" stroke="currentColor" stroke-width="1" />
        <line x1="${cx + s * 0.5}" y1="${cy - s * 0.1}" x2="${cx + s * 0.63}" y2="${cy - s * 0.2}" stroke="currentColor" stroke-width="1" />
      `;
    case 'tail':
      return `
        <path d="M ${cx} ${cy + s * 0.8} C ${cx + s * 0.3} ${cy + s * 1.1} ${cx + s * 0.5} ${cy + s * 0.9} ${cx + s * 0.4} ${cy + s * 0.7}"
              fill="none" stroke="currentColor" stroke-opacity="0.85" />
      `;
    case 'wings':
      return `
        <path d="M ${cx - s * 0.2} ${cy - s * 0.3}
                 C ${cx - s * 0.8} ${cy - s * 0.9} ${cx - s * 1.0} ${cy - s * 0.2} ${cx - s * 0.35} ${cy + s * 0.1}"
              fill="none" stroke="currentColor" stroke-opacity="0.6" />
        <path d="M ${cx + s * 0.2} ${cy - s * 0.3}
                 C ${cx + s * 0.8} ${cy - s * 0.9} ${cx + s * 1.0} ${cy - s * 0.2} ${cx + s * 0.35} ${cy + s * 0.1}"
              fill="none" stroke="currentColor" stroke-opacity="0.6" />
      `;
    default:
      return '';
  }
}

export function getCrossHatchOverlay(size: number, density: number): string {
  if (density <= 0) return '';

  const lines: string[] = [];
  const spacing = Math.max(4, Math.floor(20 * (1 - density)));
  const s = size * 0.35;
  const cx = size / 2;
  const cy = size / 2;
  const opacity = density * 0.24;

  for (let i = -s; i < s; i += spacing) {
    lines.push(
      `<line x1="${cx + i}" y1="${cy - s}" x2="${cx + i + s * 0.3}" y2="${cy + s}" stroke="currentColor" stroke-opacity="${opacity}" stroke-width="0.5" />`
    );
  }

  return lines.join('\n');
}

export function getEyeOverlay(size: number): string {
  const cx = size / 2;
  const cy = size / 2;
  const s = size * 0.4;

  return `
    <circle cx="${cx - s * 0.12}" cy="${cy - s * 0.55}" r="${s * 0.06}" fill="#ff4444" />
    <circle cx="${cx + s * 0.12}" cy="${cy - s * 0.55}" r="${s * 0.06}" fill="#ff4444" />
  `;
}
