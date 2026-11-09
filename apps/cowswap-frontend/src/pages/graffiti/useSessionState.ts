import { useState, type Dispatch, type SetStateAction } from 'react'

import { useSyncRef } from './useSyncRef'

import type { Draft, Session, WallRefs } from './wall.types'

export interface SessionState {
  /** start → place (frame movable) → paint (locked) → back to start. */
  session: Session
  setSession: Dispatch<SetStateAction<Session>>
  plotConfirmed: boolean
  setPlotConfirmed: Dispatch<SetStateAction<boolean>>
  /** The frame stops being movable once confirmed or once anything is drafted. */
  plotLocked: boolean
}

export function useSessionState({ plotConfirmedRef, plotLockedRef, sessionRef }: WallRefs, draft: Draft): SessionState {
  const [session, setSession] = useState<Session>('start')
  const [plotConfirmed, setPlotConfirmed] = useState(false)
  const plotLocked = plotConfirmed || draft.size > 0

  useSyncRef(plotConfirmedRef, plotConfirmed)
  useSyncRef(plotLockedRef, plotLocked)
  useSyncRef(sessionRef, session)

  return { session, setSession, plotConfirmed, setPlotConfirmed, plotLocked }
}
