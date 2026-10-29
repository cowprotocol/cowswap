import { ReactNode, useEffect, useRef, useState } from 'react'

import * as styledEl from './ConfirmationOutcomeSlot.styled'

import { useProgressBarLayout } from '../../hooks/useProgressBarLayout'

export interface ConfirmationOutcomeSlotProps {
  loading: boolean
  children: ReactNode
}

export function ConfirmationOutcomeSlot({ loading, children }: ConfirmationOutcomeSlotProps): ReactNode {
  const { cssVariables } = useProgressBarLayout()
  const [settled, setSettled] = useState(false)
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

function trackOutcomeHeight(panel: HTMLElement, onSettled: () => void): () => void {
  const content = panel.firstElementChild
  if (!(content instanceof HTMLElement) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    onSettled()
    return () => undefined
  }

  let target = -1
  let settled = false

  const settle = (): void => {
    if (settled) {
      return
    }

    settled = true
    window.cancelAnimationFrame(frame)
    observer?.disconnect()
    panel.removeEventListener('transitionend', onTransitionEnd)
    panel.style.transition = 'none'
    panel.style.height = 'auto'
    onSettled()
  }

  const apply = (next: number): void => {
    if (settled || next <= 0 || next === target) {
      return
    }

    const current = Math.round(panel.getBoundingClientRect().height)
    target = next
    if (next === current) {
      settle()
      return
    }

    panel.style.height = `${next}px`
  }

  const onTransitionEnd = (event: TransitionEvent): void => {
    if (event.propertyName !== 'height' || event.target !== panel) {
      return
    }

    const next = Math.round(content.scrollHeight)
    if (next > 0 && next !== target) {
      target = next
      panel.style.height = `${next}px`
      return
    }

    settle()
  }

  const measure = (): void => {
    apply(Math.round(content.scrollHeight))
  }

  const frame = window.requestAnimationFrame(measure)
  const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(measure)
  panel.addEventListener('transitionend', onTransitionEnd)
  observer?.observe(content)

  return () => {
    settled = true
    window.cancelAnimationFrame(frame)
    observer?.disconnect()
    panel.removeEventListener('transitionend', onTransitionEnd)
  }
}
