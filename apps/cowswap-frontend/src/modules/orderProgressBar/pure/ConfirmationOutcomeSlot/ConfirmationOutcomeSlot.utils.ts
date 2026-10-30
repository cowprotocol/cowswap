export function trackOutcomeHeight(panel: HTMLElement, onSettled: () => void): () => void {
  const content = panel.firstElementChild
  if (!(content instanceof HTMLElement) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    onSettled()
    return () => undefined
  }

  let target = -1
  let settled = false
  let zeroRetry = 0

  const settle = (): void => {
    if (settled) {
      return
    }

    settled = true
    window.cancelAnimationFrame(frame)
    window.cancelAnimationFrame(zeroRetry)
    observer?.disconnect()
    panel.removeEventListener('transitionend', onTransitionEnd)
    panel.style.transition = 'none'
    panel.style.height = 'auto'
    onSettled()
  }

  const apply = (next: number, confirmEmpty = false): void => {
    if (settled || (next > 0 && next === target)) {
      return
    }

    // The first frame can report 0 before layout. Settle only when the next frame is still empty.
    if (next <= 0) {
      if (confirmEmpty) {
        settle()
        return
      }

      if (zeroRetry === 0) {
        zeroRetry = window.requestAnimationFrame(() => {
          zeroRetry = 0
          apply(Math.round(content.scrollHeight), true)
        })
      }
      return
    }

    window.cancelAnimationFrame(zeroRetry)
    zeroRetry = 0

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
    window.cancelAnimationFrame(zeroRetry)
    observer?.disconnect()
    panel.removeEventListener('transitionend', onTransitionEnd)
  }
}
