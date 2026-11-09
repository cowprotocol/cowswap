import type { MutableRefObject } from 'react'

import type { Point } from './raster.utils'

/** Painted-but-unburned cells: `y * CANVAS.w + x` → 24-bit colour. */
export type Draft = Map<number, number>

/** Top-left corner of the drawing frame, and whether it is rotated to portrait. */
export interface Plot {
  x: number
  y: number
  vertical?: boolean
}

export type PlotDims = (plot: { vertical?: boolean } | null) => [number, number]

export type Session = 'start' | 'place' | 'paint'

export type Tool = 'draw' | 'pan' | 'erase' | 'text'

export interface View {
  scale: number
  offsetX: number
  offsetY: number
}

/**
 * Mutable state shared by the render loop and the input handlers. These live in
 * refs because they change on every pointer move or animation frame, where a
 * re-render per change would be far too slow.
 */
export interface WallRefs {
  seqRef: MutableRefObject<number>
  draftRef: MutableRefObject<Draft>
  plotRef: MutableRefObject<Plot | null>
  plotDimsRef: MutableRefObject<PlotDims>
  plotLockedRef: MutableRefObject<boolean>
  plotConfirmedRef: MutableRefObject<boolean>
  movingPlotRef: MutableRefObject<{ dx: number; dy: number } | null>
  plotOverlayRef: MutableRefObject<HTMLDivElement | null>
  sessionRef: MutableRefObject<Session>
  busyRef: MutableRefObject<boolean>
  fullscreenRef: MutableRefObject<boolean>
  freeSpotRef: MutableRefObject<{ x: number; y: number } | null>
  pixelsRef: MutableRefObject<Uint8ClampedArray>
  dirtyRef: MutableRefObject<boolean>
  offscreenRef: MutableRefObject<HTMLCanvasElement | null>
  patternRef: MutableRefObject<CanvasPattern | null>
  canvasElRef: MutableRefObject<HTMLCanvasElement | null>
  wrapElRef: MutableRefObject<HTMLDivElement | null>
  viewRef: MutableRefObject<View>
  minScaleRef: MutableRefObject<number>
  drawingRef: MutableRefObject<boolean>
  panningRef: MutableRefObject<boolean>
  pointersRef: MutableRefObject<Map<number, { x: number; y: number }>>
  pinchActiveRef: MutableRefObject<boolean>
  pinchPrevRef: MutableRefObject<{ dist: number; midX: number; midY: number } | null>
  strokePointsRef: MutableRefObject<Array<Point>>
  brushSizeRef: MutableRefObject<number>
  colorRef: MutableRefObject<string>
  toolRef: MutableRefObject<Tool>
}
