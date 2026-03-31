// Assemble a CreatureVisual config into a complete SVG string.

import type { CreatureVisual } from '../../engine/types';
import { getBodyTemplate } from './templates';
import { getFeatureOverlay, getCrossHatchOverlay, getEyeOverlay } from './features';

export function composeCreatureSvg(visual: CreatureVisual, size: number = 120): string {
  const body = getBodyTemplate(visual.bodyShape, size);
  const features = visual.features.map(f => getFeatureOverlay(f, size)).join('\n');
  const crossHatch = getCrossHatchOverlay(size, visual.hatchDensity);
  const eyes = getEyeOverlay(size);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" style="color: #c0c0c0;" stroke-width="${visual.lineWeight}">
  ${body}
  ${features}
  ${crossHatch}
  ${eyes}
</svg>`;
}
