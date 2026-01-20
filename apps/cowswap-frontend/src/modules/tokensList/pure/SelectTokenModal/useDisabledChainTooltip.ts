import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export interface DisabledChainTooltipState {
  activeTooltipChainId: number | null
  toggleTooltip(chainId: number): void
  hideTooltip(): void
}

/**
 * Manages tooltip visibility for disabled chain selectors.
 *
 * Provides toggle behavior where clicking the same chain hides the tooltip,
 * and clicking a different chain switches to that tooltip. The tooltip
 * automatically hides after the specified duration.
 *
 * @param durationMs - milliseconds before the tooltip auto-hides
 * @returns State and handlers for controlling tooltip visibility
 */
export function useDisabledChainTooltip(durationMs: number): DisabledChainTooltipState {
  const [activeTooltipChainId, setActiveTooltipChainId] = useState<number | null>(null)
  const hideTimerRef = useRef<number | null>(null)

  const hideTooltip = useCallback((): void => {
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }
    setActiveTooltipChainId(null)
  }, [])

  const toggleTooltip = useCallback(
    (chainId: number): void => {
      setActiveTooltipChainId((prev) => {
        if (hideTimerRef.current) {
          window.clearTimeout(hideTimerRef.current)
          hideTimerRef.current = null
        }

        const next = prev === chainId ? null : chainId
        if (next !== null) {
          hideTimerRef.current = window.setTimeout(() => {
            setActiveTooltipChainId(null)
            hideTimerRef.current = null
          }, durationMs)
        }

        return next
      })
    },
    [durationMs],
  )

  useEffect(() => {
    return hideTooltip
  }, [hideTooltip])

  return useMemo(
    () => ({ activeTooltipChainId, toggleTooltip, hideTooltip }),
    [activeTooltipChainId, toggleTooltip, hideTooltip],
  )
}
