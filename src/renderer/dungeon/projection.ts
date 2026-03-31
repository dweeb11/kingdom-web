// Pre-calculated wall segment positions for first-person dungeon view.
// Uses a simple perspective projection — walls get smaller toward the vanishing point.

export interface WallSegment {
  left: number;   // x position (0-1 normalized)
  top: number;    // y position (0-1 normalized)
  width: number;  // width (0-1 normalized)
  height: number; // height (0-1 normalized)
  distance: number;
  opacity: number;
}

// Pre-calculated segments for distances 1-5
// Each entry represents where a wall at that distance should appear on screen.
const PERSPECTIVE_SCALE = [
  { scale: 0.95, inset: 0.025 },  // distance 1 — nearly fills screen
  { scale: 0.70, inset: 0.15 },   // distance 2
  { scale: 0.50, inset: 0.25 },   // distance 3
  { scale: 0.35, inset: 0.325 },  // distance 4
  { scale: 0.20, inset: 0.40 },   // distance 5
];

export function getWallSegment(distance: number): WallSegment {
  const idx = Math.min(distance - 1, PERSPECTIVE_SCALE.length - 1);
  const p = PERSPECTIVE_SCALE[idx];

  return {
    left: p.inset,
    top: (1 - p.scale) / 2,
    width: 1 - 2 * p.inset,
    height: p.scale,
    distance,
    opacity: Math.max(0.2, 1 - (distance - 1) * 0.2),
  };
}

export interface SideWallSegment {
  side: 'left' | 'right';
  nearLeft: number;
  nearTop: number;
  nearBottom: number;
  farLeft: number;
  farTop: number;
  farBottom: number;
  distance: number;
  opacity: number;
}

export function getSideWallSegments(
  distance: number,
  hasSideWall: { left: boolean; right: boolean },
): SideWallSegment[] {
  const segments: SideWallSegment[] = [];
  const near = distance === 1
    ? { inset: 0, scale: 1 }
    : PERSPECTIVE_SCALE[Math.min(distance - 2, PERSPECTIVE_SCALE.length - 1)];
  const far = PERSPECTIVE_SCALE[Math.min(distance - 1, PERSPECTIVE_SCALE.length - 1)];

  const opacity = Math.max(0.15, 1 - (distance - 1) * 0.2);

  if (hasSideWall.left) {
    segments.push({
      side: 'left',
      nearLeft: near.inset,
      nearTop: (1 - (distance === 1 ? 1 : near.scale)) / 2,
      nearBottom: 1 - (1 - (distance === 1 ? 1 : near.scale)) / 2,
      farLeft: far.inset,
      farTop: (1 - far.scale) / 2,
      farBottom: 1 - (1 - far.scale) / 2,
      distance,
      opacity,
    });
  }

  if (hasSideWall.right) {
    segments.push({
      side: 'right',
      nearLeft: 1 - near.inset,
      nearTop: (1 - (distance === 1 ? 1 : near.scale)) / 2,
      nearBottom: 1 - (1 - (distance === 1 ? 1 : near.scale)) / 2,
      farLeft: 1 - far.inset,
      farTop: (1 - far.scale) / 2,
      farBottom: 1 - (1 - far.scale) / 2,
      distance,
      opacity,
    });
  }

  return segments;
}
