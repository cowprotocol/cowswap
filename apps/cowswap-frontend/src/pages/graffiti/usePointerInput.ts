import { useCallback, useRef, useState, type Dispatch, type SetStateAction } from 'react'

import {
  type CanvasPointerEvent,
  handlePointerDown,
  handlePointerMove,
  handlePointerUp,
  type PointerContext,
} from './pointerHandlers.utils'
import { useSyncRef } from './useSyncRef'

import type { BrushState } from './useBrush'
import type { Draft, Plot, PlotDims, WallRefs } from './wall.types'

export interface PointerInput {
  /** Cost of the stroke being drawn right now, before it joins the draft. */
  liveCost: number
  onPointerDown: (event: CanvasPointerEvent) => void
  onPointerMove: (event: CanvasPointerEvent) => void
  onPointerUp: (event: CanvasPointerEvent) => void
}

export interface UsePointerInputParams {
  brush: BrushState
  busy: boolean
  loaded: boolean
  plotDims: PlotDims
  wallColorAt: (x: number, y: number) => number
  pushHistory: () => void
  setDraft: Dispatch<SetStateAction<Draft>>
  setPlot: Dispatch<SetStateAction<Plot | null>>
  resetPhase: () => void
}

/**
 * Canvas pointer handlers. They read the latest tool state through a ref, so
 * the callbacks stay stable and never act on a stale closure.
 */
export function usePointerInput(refs: WallRefs, params: UsePointerInputParams): PointerInput {
  const { brush, busy, loaded, plotDims, wallColorAt, pushHistory, setDraft, setPlot, resetPhase } = params
  const [liveCost, setLiveCost] = useState(0)
  const context: PointerContext = {
    refs,
    tool: brush.tool,
    busy,
    loaded,
    brushSize: brush.brushSize,
    color: brush.color,
    label: brush.label,
    plotDims,
    wallColorAt,
    pushHistory,
    setDraft,
    setPlot,
    setLiveCost,
    resetPhase,
  }
  const contextRef = useRef(context)

  useSyncRef(contextRef, context)

  const onPointerDown = useCallback((event: CanvasPointerEvent): void => {
    handlePointerDown(event, contextRef.current)
  }, [])

  const onPointerMove = useCallback((event: CanvasPointerEvent): void => {
    handlePointerMove(event, contextRef.current)
  }, [])

  const onPointerUp = useCallback((event: CanvasPointerEvent): void => {
    handlePointerUp(event, contextRef.current)
  }, [])

  return { liveCost, onPointerDown, onPointerMove, onPointerUp }
}
