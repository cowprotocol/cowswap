import { useCallback, useEffect, useRef, useState } from 'react'

export interface DisabledChainTooltipState {
  activeTooltipChainId: number | null
  toggleTooltip(chainId: number): void
  hideTooltip(): void
}

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

  return { activeTooltipChainId, toggleTooltip, hideTooltip }
}
