/**
 * `top` of a sticky element that keeps `gap` above it when it fits the viewport. A taller element gets a negative
 * `top`, so it scrolls until its bottom is `gap` above the viewport bottom, then sticks.
 */
export function getStickyTop(viewportHeight: number, elementHeight: number, gap: number): number {
  return Math.min(gap, viewportHeight - elementHeight - gap)
}
