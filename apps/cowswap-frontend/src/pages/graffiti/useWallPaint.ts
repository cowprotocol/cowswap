import { useCallback } from 'react'

import { type PaintFlow, usePaintFlow } from './usePaintFlow'

import type { CanvasInfo } from './graffiti.service'
import type { DraftState } from './useDraft'
import type { SessionState } from './useSessionState'

export interface UseWallPaintParams {
  solanaAccount: string | null | undefined
  connected: boolean
  info: CanvasInfo | null
  draft: DraftState
  session: SessionState
  markSeq: (seq: number) => void
}

export interface WallPaint extends PaintFlow {
  /** A burn is in flight: the wallet, the chain or the wall is working. */
  busy: boolean
  paintDisabled: boolean
  /** Clear a previous success/failure message. */
  resetPhase: () => void
}

/** The paint flow, plus what happens to the page once the wall accepts a draw. */
export function useWallPaint(params: UseWallPaintParams): WallPaint {
  const { solanaAccount, connected, info, draft, session, markSeq } = params
  const { setSession, setPlotConfirmed } = session
  const { setDraft } = draft

  const onApplied = useCallback(
    (seq: number): void => {
      setSession('start')
      setPlotConfirmed(false)
      markSeq(seq)
      setDraft(new Map())
    },
    [markSeq, setDraft, setPlotConfirmed, setSession],
  )

  const flow = usePaintFlow({ draft: draft.draft, solanaAccount, info, onApplied })
  const { phase, setPhase, setPhaseError } = flow

  const busy = phase !== 'idle' && phase !== 'done' && phase !== 'error'
  const paintDisabled = !connected || draft.draft.size === 0 || busy || draft.boxTooBig

  const resetPhase = useCallback((): void => {
    setPhase('idle')
    setPhaseError(null)
  }, [setPhase, setPhaseError])

  return { ...flow, busy, paintDisabled, resetPhase }
}
