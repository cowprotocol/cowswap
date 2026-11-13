import { type MutableRefObject, type RefCallback, useCallback, useState } from 'react'

import { DEFAULT_BRUSH, DEFAULT_COLOR, DEFAULT_PLOT_HEIGHT, DEFAULT_PLOT_WIDTH, PIXELS_LENGTH } from './wall.constants'

import type { AutoView, WallRefs, WallSnapshot } from './wall.types'

function defaultPlotDims(plot: { vertical?: boolean } | null): [number, number] {
  return plot?.vertical ? [DEFAULT_PLOT_HEIGHT, DEFAULT_PLOT_WIDTH] : [DEFAULT_PLOT_WIDTH, DEFAULT_PLOT_HEIGHT]
}

const INITIAL_SNAPSHOT: WallSnapshot = {
  loaded: false,
  busy: false,
  session: 'start',
  fullscreen: false,
  tool: 'draw',
  brushSize: DEFAULT_BRUSH,
  color: DEFAULT_COLOR,
  label: '',
  draft: new Map(),
  plot: null,
  plotDims: defaultPlotDims,
  plotLocked: false,
  plotConfirmed: false,
}

export interface WallDomBindings {
  wrap: RefCallback<HTMLDivElement>
  canvas: RefCallback<HTMLCanvasElement>
  paintCanvas: RefCallback<HTMLCanvasElement>
  overlay: RefCallback<HTMLDivElement>
  confirm: RefCallback<HTMLDivElement>
  /** The mounted canvas, for hooks that attach native listeners to it. */
  canvasEl: HTMLCanvasElement | null
}

export function createWallRefs(): WallRefs {
  return {
    snapshotRef: ref(INITIAL_SNAPSHOT),
    requestRenderRef: ref(() => undefined),

    pixelsRef: ref(new Uint8ClampedArray(PIXELS_LENGTH)),
    dirtyRef: ref(true),
    offscreenRef: ref(null),
    patternRef: ref(null),

    canvasElRef: ref(null),
    paintCanvasElRef: ref(null),
    wrapElRef: ref(null),
    plotOverlayRef: ref(null),
    plotConfirmRef: ref(null),

    viewRef: ref({ scale: 1, offsetX: 0, offsetY: 0 }),
    minScaleRef: ref(0.06),
    autoViewRef: ref<AutoView>('cover'),

    drawingRef: ref(false),
    panningRef: ref(false),
    activePointersRef: ref(new Set()),
    pinchActiveRef: ref(false),
    strokePointsRef: ref([]),
    movingPlotRef: ref(null),

    seqRef: ref(0),
    freeSpotRef: ref(null),
  }
}

/**
 * Callback refs that record the wall's DOM nodes in the shared refs, so the view
 * binds elements without ever touching a ref object.
 */
export function useWallDomBindings({
  wrapElRef,
  canvasElRef,
  paintCanvasElRef,
  plotOverlayRef,
  plotConfirmRef,
}: WallRefs): WallDomBindings {
  const [canvasEl, setCanvasEl] = useState<HTMLCanvasElement | null>(null)

  const wrap = useCallback(
    (el: HTMLDivElement | null): void => {
      wrapElRef.current = el
    },
    [wrapElRef],
  )
  const canvas = useCallback(
    (el: HTMLCanvasElement | null): void => {
      canvasElRef.current = el
      setCanvasEl(el)
    },
    [canvasElRef],
  )
  const paintCanvas = useCallback(
    (el: HTMLCanvasElement | null): void => {
      paintCanvasElRef.current = el
    },
    [paintCanvasElRef],
  )
  const overlay = useCallback(
    (el: HTMLDivElement | null): void => {
      plotOverlayRef.current = el
    },
    [plotOverlayRef],
  )
  const confirm = useCallback(
    (el: HTMLDivElement | null): void => {
      plotConfirmRef.current = el
    },
    [plotConfirmRef],
  )

  return { wrap, canvas, paintCanvas, overlay, confirm, canvasEl }
}

/**
 * Every ref the render loop and input handlers share. The object itself is
 * created once and never changes identity, so it is safe in dependency arrays.
 */
export function useWallRefs(): WallRefs {
  const [refs] = useState(createWallRefs)

  return refs
}

function ref<T>(current: T): MutableRefObject<T> {
  return { current }
}
