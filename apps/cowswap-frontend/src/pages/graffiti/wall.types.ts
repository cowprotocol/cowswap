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
 * Live interaction state, mutated between React renders.
 *
 * Everything here changes on a pointer move or an animation frame, where a
 * re-render per change would be far too slow. State that React owns lives in
 * `snapshotRef` instead.
 */
export interface WallRefs {
  /** Latest committed React state; see WallSnapshot. */
  snapshotRef: MutableRefObject<WallSnapshot>
  /** Ask for an animation frame. Set by useWallRenderLoop; a no-op until it mounts. */
  requestRenderRef: MutableRefObject<() => void>

  // Wall pixels and their offscreen copy.
  pixelsRef: MutableRefObject<Uint8ClampedArray>
  /** The pixel buffer changed and must be re-uploaded to the offscreen canvas. */
  dirtyRef: MutableRefObject<boolean>
  offscreenRef: MutableRefObject<HTMLCanvasElement | null>
  patternRef: MutableRefObject<CanvasPattern | null>

  // DOM.
  canvasElRef: MutableRefObject<HTMLCanvasElement | null>
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

  /** Highest sequence number applied from the server. */
  seqRef: MutableRefObject<number>
  /** Where the frame was first auto-placed; set once. */
  freeSpotRef: MutableRefObject<{ x: number; y: number } | null>
}

/**
 * The React state the render loop and the pointer handlers need, copied into a
 * ref after every commit.
 *
 * Both of them run outside React — the loop on animation frames, the handlers
 * on native events — so they cannot read state directly without capturing a
 * stale closure. Keeping one snapshot rather than a ref per field means there
 * is a single place to look for "what the canvas currently believes".
 */
export interface WallSnapshot {
  /** The wall snapshot has arrived; drawing is allowed. */
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
