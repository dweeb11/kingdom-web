// Assemble a CreatureVisual config into a complete SVG string.

import type { CreatureVisual } from '../../engine/types';
import { getBodyTemplate } from './templates';
import { getFeatureOverlay, getCrossHatchOverlay, getEyeOverlay } from './features';

export function composeCreatureSvg(visual: CreatureVisual, size: number = 120): string {
  const body = getBodyTemplate(visual.bodyShape, size);
  const features = visual.features.map(f => getFeatureOverlay(f, size)).join('\n');
  const crossHatch = getCrossHatchOverlay(size, visual.hatchDensity);
  const eyes = getEyeOverlay(size);
  const strokeWeight = Math.max(1.5, visual.lineWeight);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" style="color: #c4cbdd;" stroke-width="${strokeWeight}" stroke-linecap="round" stroke-linejoin="round">
  <defs>
    <linearGradient id="bodyShade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(196,203,221,0.18)" />
      <stop offset="100%" stop-color="rgba(110,120,140,0.05)" />
    </linearGradient>
  </defs>
  <g vector-effect="non-scaling-stroke">
  ${body}
  ${features}
  <ellipse cx="${size / 2}" cy="${size * 0.6}" rx="${size * 0.28}" ry="${size * 0.2}" fill="url(#bodyShade)" />
  ${crossHatch}
  ${eyes}
  </g>
</svg>`;
}
