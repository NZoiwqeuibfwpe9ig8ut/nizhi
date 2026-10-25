/**
 * Deterministic contour field shared by the static SVG fallback (built at
 * compile time) and the Three.js scene (built in the browser after LCP).
 * Keeping both on the same height function means the enhancement never
 * visually jumps to a different landscape.
 */

export interface ContourSegment {
  level: number;
  a: [number, number];
  b: [number, number];
}

interface ContourOptions {
  extent?: number;
  resolution?: number;
  levels?: number[];
  clip?: (x: number, z: number) => boolean;
}

/** A ragged, island-like boundary so the field reads as an object, not wallpaper. */
export function islandRadius(x: number, z: number): number {
  const angle = Math.atan2(z, x);
  const distance = Math.hypot(x * 0.98, z * 1.04);
  const edge = 7.75 + Math.sin(angle * 3 + 0.65) * 0.8 + Math.cos(angle * 5 - 0.4) * 0.42;
  return distance <= edge ? edge - distance : -1;
}

export function insideIsland(x: number, z: number): boolean {
  return islandRadius(x, z) >= 0;
}

export function islandBoundary(count = 128): [number, number][] {
  return Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * Math.PI * 2;
    const radius = 7.7 + Math.sin(angle * 3 + 0.65) * 0.8 + Math.cos(angle * 5 - 0.4) * 0.42;
    return [Math.cos(angle) * (radius / 0.98), Math.sin(angle) * (radius / 1.04)] as [number, number];
  });
}

/** A soft ridge-and-basin field in roughly [0, 1]. */
export function terrainHeight(x: number, z: number): number {
  const warp = Math.cos(z * 0.27 + x * 0.08) * 1.15;
  const main = Math.sin(x * 0.48 + warp) * 0.42;
  const cross = Math.cos(z * 0.42 - x * 0.14) * 0.27;
  const ridge = Math.sin((x + z * 0.7) * 0.82) * 0.13;
  const basin =
    Math.exp(-(((x - 1.9) * (x - 1.9)) / 13 + ((z + 1.4) * (z + 1.4)) / 8)) * 0.28;
  const shelf = Math.cos(Math.hypot(x + 2.6, z - 1.8) * 0.95) * 0.1;
  return clamp((main + cross + ridge + basin + shelf + 0.92) / 1.84, 0.02, 0.98);
}

export function makeLevels(count: number, min = 0.1, max = 0.92): number[] {
  return Array.from({ length: count }, (_, index) => min + ((max - min) * index) / (count - 1));
}

/**
 * Marching squares. The field is sampled once, then crossed for every level,
 * which keeps the browser start-up cost predictable (~20–60 ms on a laptop).
 */
export function buildContours({
  extent = 9.5,
  resolution = 112,
  levels = makeLevels(24),
  clip,
}: ContourOptions = {}): ContourSegment[] {
  const step = (extent * 2) / resolution;
  const side = resolution + 1;
  const values = new Float32Array(side * side);

  for (let row = 0; row < side; row += 1) {
    const z = -extent + row * step;
    for (let column = 0; column < side; column += 1) {
      const x = -extent + column * step;
      values[row * side + column] = terrainHeight(x, z);
    }
  }

  const segments: ContourSegment[] = [];

  for (const level of levels) {
    for (let row = 0; row < resolution; row += 1) {
      const z0 = -extent + row * step;
      const z1 = z0 + step;

      for (let column = 0; column < resolution; column += 1) {
        const x0 = -extent + column * step;
        const x1 = x0 + step;
        const a = values[row * side + column];
        const b = values[row * side + column + 1];
        const c = values[(row + 1) * side + column + 1];
        const d = values[(row + 1) * side + column];

        const insideA = a > level;
        const insideB = b > level;
        const insideC = c > level;
        const insideD = d > level;
        if (insideA === insideB && insideB === insideC && insideC === insideD) continue;

        const crossings: [number, number][] = [];

        if (insideA !== insideB) crossings.push(interpolate(x0, z0, a, x1, z0, b, level));
        if (insideB !== insideC) crossings.push(interpolate(x1, z0, b, x1, z1, c, level));
        if (insideC !== insideD) crossings.push(interpolate(x1, z1, c, x0, z1, d, level));
        if (insideD !== insideA) crossings.push(interpolate(x0, z1, d, x0, z0, a, level));

        if (crossings.length === 2) {
          const midX = (crossings[0][0] + crossings[1][0]) / 2;
          const midZ = (crossings[0][1] + crossings[1][1]) / 2;
          if (!clip || clip(midX, midZ)) segments.push({ level, a: crossings[0], b: crossings[1] });
        } else if (crossings.length === 4) {
          // Resolve the saddle. Either interpretation is visually valid at this
          // density; the centre test avoids a checkerboard of broken saddles.
          const centreAbove = (a + b + c + d) / 4 > level;
          const pairs: [number, number][] = centreAbove
            ? [
                [0, 1],
                [2, 3],
              ]
            : [
                [0, 3],
                [1, 2],
              ];
          for (const [first, second] of pairs) {
            const midX = (crossings[first][0] + crossings[second][0]) / 2;
            const midZ = (crossings[first][1] + crossings[second][1]) / 2;
            if (!clip || clip(midX, midZ)) {
              segments.push({ level, a: crossings[first], b: crossings[second] });
            }
          }
        }
      }
    }
  }

  return segments;
}

function interpolate(
  x1: number,
  z1: number,
  value1: number,
  x2: number,
  z2: number,
  value2: number,
  level: number,
): [number, number] {
  const span = value2 - value1;
  const t = Math.abs(span) < 1e-8 ? 0.5 : (level - value1) / span;
  return [x1 + (x2 - x1) * t, z1 + (z2 - z1) * t];
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Group segments into one SVG path per contour level to keep fallback HTML small. */
export function segmentsToPaths(
  segments: ContourSegment[],
  project: (x: number, z: number, level: number) => [number, number],
): Map<number, string> {
  const paths = new Map<number, string>();

  for (const segment of segments) {
    const [x1, y1] = project(segment.a[0], segment.a[1], segment.level);
    const [x2, y2] = project(segment.b[0], segment.b[1], segment.level);
    const move = `M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}`;
    paths.set(segment.level, `${paths.get(segment.level) ?? ''}${move}`);
  }

  return paths;
}
