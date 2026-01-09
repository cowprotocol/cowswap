const BORDER_WIDTH_MIN = 1.5
const BORDER_WIDTH_MAX = 2.2
const BORDER_WIDTH_RATIO = 0.15

export const getBorderWidth = (size: number): number =>
  Math.max(BORDER_WIDTH_MIN, Math.min(BORDER_WIDTH_MAX, size * BORDER_WIDTH_RATIO))
