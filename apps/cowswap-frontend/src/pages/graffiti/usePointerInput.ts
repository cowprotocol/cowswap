import { useCallback, useMemo, useState, type Dispatch, type SetStateAction } from 'react'

import {
  type CanvasPointerEvent,
  cancelInteraction,
  handlePointerDown,
  handlePointerMove,
  handlePointerUp,
  type PointerContext,
} from './pointerHandlers.utils'

import type { Draft, Plot, WallRefs } from './wall.types'

export interface PointerInput {
  /** Cost of the stroke being drawn right now, before it joins the draft. */
  liveCost: number
  onPointerDown: (event: CanvasPointerEvent) => void
  onPointerMove: (event: CanvasPointerEvent) => void
  onPointerUp: (event: CanvasPointerEvent) => void
  /** Abandon the stroke, pan or frame drag in progress. */
  cancelInteraction: () => void
}

export interface UsePointerInputParams {
  wallColorAt: (x: number, y: number) => number
  pushHistory: () => void
  setDraft: Dispatch<SetStateAction<Draft>>
  setPlot: Dispatch<SetStateAction<Plot | null>>
  resetPhase: () => void
}

/** State reaches the handlers via `snapshotRef`, so these callbacks stay stable. */
export function usePointerInput(refs: WallRefs, params: UsePointerInputParams): PointerInput {
  const { wallColorAt, pushHistory, setDraft, setPlot, resetPhase } = params
  const [liveCost, setLiveCost] = useState(0)

  const context = useMemo<PointerContext>(
    () => ({ refs, wallColorAt, pushHistory, setDraft, setPlot, setLiveCost, resetPhase }),
    [pushHistory, refs, resetPhase, setDraft, setPlot, wallColorAt],
  )

  const onPointerDown = useCallback((event: CanvasPointerEvent): void => handlePointerDown(event, context), [context])
  const onPointerMove = useCallback((event: CanvasPointerEvent): void => handlePointerMove(event, context), [context])
  const onPointerUp = useCallback((event: CanvasPointerEvent): void => handlePointerUp(event, context), [context])
  const cancel = useCallback((): void => cancelInteraction(context), [context])

  return { liveCost, onPointerDown, onPointerMove, onPointerUp, cancelInteraction: cancel }
}
