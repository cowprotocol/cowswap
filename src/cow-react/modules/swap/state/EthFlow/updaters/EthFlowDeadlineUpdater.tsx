import { useEffect, useState } from 'react'
import { useUserTransactionTTL } from 'state/user/hooks'
import { useIsEthFlow } from '@cow/modules/swap/hooks/useIsEthFlow'

const STORAGE_KEY = 'UserPreviousDeadline'
// Minimum deadline for EthFlow orders. Like the default deadline, anything smaller will be replaced by this
export const MINIMUM_ETH_FLOW_DEADLINE_SECONDS = 600 // 10 minutes in SECONDS

export function EthFlowDeadlineUpdater() {
  const [mounted, setMounted] = useState(false)

  // user deadline (in seconds)
  const [userDeadline, setUserDeadline] = useUserTransactionTTL()
  const isEthFlow = useIsEthFlow()

  // on updater mount, load previous deadline from localStorage and set it, if it exists
  useEffect(() => {
    const previousDeadline = _loadDeadline()

    // only update if some storage amt exists
    if (previousDeadline) {
      setUserDeadline(previousDeadline)
    }

    setMounted(true)
    // we only want this on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (isEthFlow) {
      // if EthFlow and deadline < than minimum, set it to minimum
      const deadlineLessThanThreshold = MINIMUM_ETH_FLOW_DEADLINE_SECONDS > userDeadline
      if (deadlineLessThanThreshold) {
        console.log(
          '[EthFlowDeadlineUpdater] - Setting user deadline to minimum threshold of 10 minutes',
          isEthFlow,
          userDeadline,
          deadlineLessThanThreshold
        )
        _saveDeadline(userDeadline)
        setUserDeadline(MINIMUM_ETH_FLOW_DEADLINE_SECONDS)
      }
    } else if (mounted) {
      // if we are leaving EthFlow context, reset deadline to previous value
      _resetDeadline(setUserDeadline)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEthFlow])

  return null
}

function _saveDeadline(currentUserDeadline: number): void {
  return localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUserDeadline))
}

function _loadDeadline(): number | null {
  const previousDeadlineStorage = localStorage.getItem(STORAGE_KEY)

  return previousDeadlineStorage ? +JSON.parse(previousDeadlineStorage) : null
}

function _resetDeadline(setUserDeadline: (slippage: number) => void): void {
  const parsedDeadline = _loadDeadline()
  // user switched back to non-native swap, set deadline back to previous value
  parsedDeadline && setUserDeadline(parsedDeadline)
}
