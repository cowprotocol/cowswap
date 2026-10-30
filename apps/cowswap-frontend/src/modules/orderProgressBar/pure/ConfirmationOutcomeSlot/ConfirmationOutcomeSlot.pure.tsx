import { ReactNode, useEffect, useRef, useState } from 'react'

import * as styledEl from './ConfirmationOutcomeSlot.styled'
import { trackOutcomeHeight } from './ConfirmationOutcomeSlot.utils'

import { useProgressBarLayout } from '../../hooks/useProgressBarLayout'

export interface ConfirmationOutcomeSlotProps {
  loading: boolean
  children: ReactNode
}

export function ConfirmationOutcomeSlot({ loading, children }: ConfirmationOutcomeSlotProps): ReactNode {
  const { cssVariables } = useProgressBarLayout()
  const [settled, setSettled] = useState(false)

  if (loading && settled) {
    setSettled(false)
  }

  const reserveHeight = loading || !settled

  return (
    <styledEl.Frame $reserveHeight={reserveHeight} style={reserveHeight ? cssVariables : undefined}>
      {loading ? (
        <styledEl.LoadingBox data-testid="confirmation-outcome-loading" />
      ) : (
        <OutcomeReveal settled={settled} onSettled={() => setSettled(true)}>
          {children}
        </OutcomeReveal>
      )}
    </styledEl.Frame>
  )
}

function OutcomeReveal({
  children,
  settled,
  onSettled,
}: {
  children: ReactNode
  settled: boolean
  onSettled: () => void
}): ReactNode {
  const panelRef = useRef<HTMLDivElement>(null)
  const onSettledRef = useRef(onSettled)

  useEffect(() => {
    onSettledRef.current = onSettled
  }, [onSettled])

  useEffect(() => {
    const panel = panelRef.current
    if (!panel || settled) {
      return
    }

    return trackOutcomeHeight(panel, () => onSettledRef.current())
  }, [settled])

  useEffect(() => {
    const panel = panelRef.current
    if (!panel || !settled) {
      return
    }

    panel.style.height = ''
    panel.style.transition = ''
  }, [settled])

  return (
    <styledEl.Reveal ref={panelRef} $settled={settled} data-testid="confirmation-outcome">
      <styledEl.Content>{children}</styledEl.Content>
    </styledEl.Reveal>
  )
}
