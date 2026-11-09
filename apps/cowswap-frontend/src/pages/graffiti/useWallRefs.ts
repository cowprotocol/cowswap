import { type MutableRefObject, type RefCallback, useCallback, useState } from 'react'

import { DEFAULT_BRUSH, DEFAULT_COLOR, DEFAULT_PLOT_HEIGHT, DEFAULT_PLOT_WIDTH, PIXELS_LENGTH } from './wall.constants'

import type { WallRefs } from './wall.types'

export interface WallDomBindings {
  wrap: RefCallback<HTMLDivElement>
  canvas: RefCallback<HTMLCanvasElement>
  overlay: RefCallback<HTMLDivElement>
}

export function createWallRefs(): WallRefs {
  return {
    seqRef: ref(0),
    draftRef: ref(new Map()),
    plotRef: ref(null),
    plotDimsRef: ref(defaultPlotDims),
    plotLockedRef: ref(false),
    plotConfirmedRef: ref(false),
    movingPlotRef: ref(null),
    plotOverlayRef: ref(null),
    sessionRef: ref('start'),
    busyRef: ref(false),
    fullscreenRef: ref(false),
    freeSpotRef: ref(null),
    pixelsRef: ref(new Uint8ClampedArray(PIXELS_LENGTH)),
    dirtyRef: ref(true),
    offscreenRef: ref(null),
    patternRef: ref(null),
    canvasElRef: ref(null),
    wrapElRef: ref(null),
    viewRef: ref({ scale: 1, offsetX: 0, offsetY: 0 }),
    minScaleRef: ref(0.06),
    drawingRef: ref(false),
    panningRef: ref(false),
    pointersRef: ref(new Map()),
    pinchActiveRef: ref(false),
    pinchPrevRef: ref(null),
    strokePointsRef: ref([]),
    brushSizeRef: ref(DEFAULT_BRUSH),
    colorRef: ref(DEFAULT_COLOR),
    toolRef: ref('draw'),
  }
}

/**
 * Callback refs that record the wall's DOM nodes in the shared refs, so the view
 * binds elements without ever touching a ref object.
 */
export function useWallDomBindings({ wrapElRef, canvasElRef, plotOverlayRef }: WallRefs): WallDomBindings {
  const wrap = useCallback(
    (el: HTMLDivElement | null): void => {
      wrapElRef.current = el
    },
    [wrapElRef],
  )
  const canvas = useCallback(
    (el: HTMLCanvasElement | null): void => {
      canvasElRef.current = el
    },
    [canvasElRef],
  )
  const overlay = useCallback(
    (el: HTMLDivElement | null): void => {
      plotOverlayRef.current = el
    },
    [plotOverlayRef],
  )

  return { wrap, canvas, overlay }
}

/**
 * Every ref the render loop and input handlers share. The object itself is
 * created once and never changes identity, so it is safe in dependency arrays.
 */
export function useWallRefs(): WallRefs {
  const [refs] = useState(createWallRefs)

  return refs
}

function defaultPlotDims(plot: { vertical?: boolean } | null): [number, number] {
  return plot?.vertical ? [DEFAULT_PLOT_HEIGHT, DEFAULT_PLOT_WIDTH] : [DEFAULT_PLOT_WIDTH, DEFAULT_PLOT_HEIGHT]
}

function ref<T>(current: T): MutableRefObject<T> {
  return { current }
}
