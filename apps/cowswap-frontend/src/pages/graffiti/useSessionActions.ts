import { useCallback, useEffect, type Dispatch, type SetStateAction } from 'react'

import { CANVAS } from './raster.utils'

import type { Draft, Plot, PlotDims, Session, WallRefs } from './wall.types'

export interface SessionActions {
  /** Start → place: make the frame movable and bring it into view. */
  startDrawing: () => void
  /** Place → paint: lock the frame where it is. */
  confirmPlot: () => void
  undo: () => void
  /** Wipe the draft and put the frame back in movable mode. */
  clearAll: () => void
  rotatePlot: () => void
  /** Abandon the session and return to Start. */
  resetToStart: () => void
}

export interface UseSessionActionsParams {
  setDraft: Dispatch<SetStateAction<Draft>>
  pushHistory: () => void
  popHistory: () => Draft | undefined
  setPlot: Dispatch<SetStateAction<Plot | null>>
  plotDims: PlotDims
  setSession: Dispatch<SetStateAction<Session>>
  setPlotConfirmed: Dispatch<SetStateAction<boolean>>
  zoomToPlot: () => void
  resetPhase: () => void
}

export function useSessionActions(refs: WallRefs, params: UseSessionActionsParams): SessionActions {
  const { setDraft, pushHistory, popHistory, setPlot, plotDims } = params
  const { setSession, setPlotConfirmed, zoomToPlot, resetPhase } = params
  const { snapshotRef } = refs
  const resetToStart = useCallback((): void => {
    setDraft(new Map())
    setPlotConfirmed(false)
    setSession('start')
    resetPhase()
  }, [resetPhase, setDraft, setPlotConfirmed, setSession])

  const undo = useCallback((): void => {
    const previous = popHistory()
    const { draft, plotConfirmed } = snapshotRef.current
    const nextSize = previous ? previous.size : draft.size

    if (previous) setDraft(previous)

    // Undoing back to nothing returns the frame to movable mode.
    if (nextSize === 0 && plotConfirmed) {
      setPlotConfirmed(false)
      setSession('place')
      zoomToPlot()
    }
  }, [popHistory, setDraft, setPlotConfirmed, setSession, snapshotRef, zoomToPlot])

  const clearAll = useCallback((): void => {
    pushHistory()
    setDraft(new Map())
    setPlotConfirmed(false)
    setSession('place')
    zoomToPlot()
  }, [pushHistory, setDraft, setPlotConfirmed, setSession, zoomToPlot])

  const startDrawing = useCallback((): void => {
    setSession('place')
    zoomToPlot()
  }, [setSession, zoomToPlot])

  const confirmPlot = useCallback((): void => {
    setPlotConfirmed(true)
    setSession('paint')
    zoomToPlot()
  }, [setPlotConfirmed, setSession, zoomToPlot])

  const rotatePlot = useCallback((): void => {
    setPlot((p) => {
      if (!p) return p

      const vertical = !p.vertical
      const [pw, ph] = plotDims({ vertical })

      return { x: clamp(p.x, CANVAS.w - pw), y: clamp(p.y, CANVAS.h - ph), vertical }
    })
  }, [plotDims, setPlot])

  useUndoShortcut(undo)
  useEscapeToCancel(refs, resetToStart)
  useEnterToConfirmPlot(refs, confirmPlot)

  return { startDrawing, confirmPlot, undo, clearAll, rotatePlot, resetToStart }
}

function clamp(value: number, max: number): number {
  return Math.max(0, Math.min(max, value))
}

const INTERACTIVE_TAGS = new Set(['a', 'button', 'input', 'select', 'textarea'])

/** A focused control owns Enter: it must fire its own action, not the frame's. */
function ownsEnter(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false

  return INTERACTIVE_TAGS.has(targetTag(target)) || target.isContentEditable
}

function targetTag(target: EventTarget | null): string {
  return target instanceof HTMLElement ? target.tagName.toLowerCase() : ''
}

/** Enter while placing confirms the frame, the keyboard twin of ✓ draw here. */
function useEnterToConfirmPlot({ snapshotRef }: WallRefs, confirmPlot: () => void): void {
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key !== 'Enter' || ownsEnter(e.target)) return

      const { busy, session, plotLocked, fullscreen } = snapshotRef.current

      if (busy || fullscreen || plotLocked || session !== 'place') return

      confirmPlot()
    }

    window.addEventListener('keydown', onKey)

    return () => window.removeEventListener('keydown', onKey)
  }, [confirmPlot, snapshotRef])
}

/** ESC during placement/painting behaves like ✕ cancel, but never mid-transaction. */
function useEscapeToCancel({ snapshotRef }: WallRefs, resetToStart: () => void): void {
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key !== 'Escape') return
      if (document.fullscreenElement) return // ESC exits fullscreen first
      const { busy, session } = snapshotRef.current

      if (busy || session === 'start') return

      resetToStart()
    }

    window.addEventListener('keydown', onKey)

    return () => window.removeEventListener('keydown', onKey)
  }, [resetToStart, snapshotRef])
}

/** Cmd/Ctrl+Z, except while typing in a field. */
function useUndoShortcut(undo: () => void): void {
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== 'z') return

      const tag = targetTag(e.target)

      if (tag === 'input' || tag === 'textarea') return

      e.preventDefault()
      undo()
    }

    window.addEventListener('keydown', onKey)

    return () => window.removeEventListener('keydown', onKey)
  }, [undo])
}
