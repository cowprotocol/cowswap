import { CANVAS } from './raster.utils'

import type { PaintPhase } from './usePaintFlow'

export const PALETTE = [
  '#00ffa3',
  '#00d0ff',
  '#ff2ea6',
  '#ffe600',
  '#ff5c00',
  '#a855f7',
  '#ffffff',
  '#111118',
  '#7f8c8d',
  '#2ecc71',
  '#2980ff',
  '#c0392b',
]

export const DEFAULT_COLOR = '#00ffa3'
export const DEFAULT_BRUSH = 3
export const MIN_BRUSH = 1
export const MAX_BRUSH = 40

/** Wall size the pixel buffer is allocated for before GET /v1/info reports the real one. */
export const PIXELS_LENGTH = CANVAS.w * CANVAS.h * 4

/** Below this width the tools collapse into a bottom sheet. */
export const NARROW_BREAKPOINT_PX = 780

/** Frame size used until GET /v1/info reports the configured one. */
export const DEFAULT_PLOT_WIDTH = 256
export const DEFAULT_PLOT_HEIGHT = 128

export const PHASE_LABEL: Record<PaintPhase, string> = {
  idle: '',
  quoting: 'Counting cells…',
  'awaiting wallet': 'Approve the burn in your wallet…',
  confirming: 'Confirming burn on Solana…',
  painting: 'Painting the wall…',
  done: 'Painted! 🔥',
  error: 'Failed',
}
