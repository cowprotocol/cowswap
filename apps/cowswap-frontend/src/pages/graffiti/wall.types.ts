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
 * Live interaction state, mutated between renders: a re-render per pointer move
 * would be far too slow. State React owns lives in `snapshotRef`.
 */
export interface WallRefs {
  snapshotRef: MutableRefObject<WallSnapshot>
  /** Ask for an animation frame. Set by useWallRenderLoop; a no-op until it mounts. */
  requestRenderRef: MutableRefObject<() => void>

  // Wall pixels and their offscreen copy.
  pixelsRef: MutableRefObject<Uint8ClampedArray>
  /** The pixel buffer changed and needs re-uploading. */
  dirtyRef: MutableRefObject<boolean>
  offscreenRef: MutableRefObject<HTMLCanvasElement | null>
  patternRef: MutableRefObject<CanvasPattern | null>

  // DOM.
  /** Top layer: grid, plot frame and the hatch backdrop. Also the pointer target. */
  canvasElRef: MutableRefObject<HTMLCanvasElement | null>
  /** Bottom layer: wall pixels only, so it can blend with the page background. */
  paintCanvasElRef: MutableRefObject<HTMLCanvasElement | null>
  wrapElRef: MutableRefObject<HTMLDivElement | null>
  plotOverlayRef: MutableRefObject<HTMLDivElement | null>

  // Viewport.
  viewRef: MutableRefObject<View>
  minScaleRef: MutableRefObject<number>

  // Pointer state machine.
  drawingRef: MutableRefObject<boolean>
  panningRef: MutableRefObject<boolean>
  /** Pointers currently down on the canvas; two or more means a pinch, never a stroke. */
  activePointersRef: MutableRefObject<Set<number>>
  pinchActiveRef: MutableRefObject<boolean>
  strokePointsRef: MutableRefObject<Array<Point>>
  movingPlotRef: MutableRefObject<{ dx: number; dy: number } | null>

  seqRef: MutableRefObject<number>
  /** Where the frame was first auto-placed; set once. */
  freeSpotRef: MutableRefObject<{ x: number; y: number } | null>
}

/**
 * React state copied into a ref after every commit. The render loop and pointer
 * handlers run outside React, so reading state directly would capture a stale
 * closure.
 */
export interface WallSnapshot {
  loaded: boolean
  /** A burn is in flight: the wallet, the chain or the wall is working. */
  busy: boolean
  session: Session
  fullscreen: boolean
  tool: Tool
  brushSize: number
  /** Colour a stroke paints with. The eraser resolves to the wall background. */
  color: string
  /** Text stamped by the text tool. */
  label: string
  draft: Draft
  plot: Plot | null
  plotDims: PlotDims
  plotLocked: boolean
  plotConfirmed: boolean
}
