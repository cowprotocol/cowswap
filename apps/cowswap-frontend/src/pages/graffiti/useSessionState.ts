import { useState, type Dispatch, type SetStateAction } from 'react'

import type { Draft, Session } from './wall.types'

export interface SessionState {
  /** start → place (frame movable) → paint (locked) → back to start. */
  session: Session
  setSession: Dispatch<SetStateAction<Session>>
  plotConfirmed: boolean
  setPlotConfirmed: Dispatch<SetStateAction<boolean>>
  /** The frame stops being movable once confirmed or once anything is drafted. */
  plotLocked: boolean
}

export function useSessionState(draft: Draft): SessionState {
  const [session, setSession] = useState<Session>('start')
  const [plotConfirmed, setPlotConfirmed] = useState(false)

  return {
    session,
    setSession,
    plotConfirmed,
    setPlotConfirmed,
    plotLocked: plotConfirmed || draft.size > 0,
  }
}
