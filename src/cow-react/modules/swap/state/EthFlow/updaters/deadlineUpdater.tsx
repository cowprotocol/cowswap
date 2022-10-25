import { useEffect, useState } from 'react'
import { useUserTransactionTTL } from 'state/user/hooks'
import { useIsEthFlow } from '@cow/modules/swap/hooks/useIsEthFlow'

const STORAGE_KEY = 'UserPreviousDeadline'
// 10 minutes in SECONDS
export const DEADLINE_LOWER_THRESHOLD_SECONDS = 600

export function EthFlowDeadlineUpdater() {
  const [mounted, setMounted] = useState(false)

  // USER DEADLINE (IN SECONDS)
  const [userDeadline, setUserDeadline] = useUserTransactionTTL()
  const isEthFlow = useIsEthFlow()

  // on updater mount
  useEffect(() => {
    const previousDeadline = _parsePreviousDeadlineFromStorage()

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
      const deadlineLessThanThreshold = DEADLINE_LOWER_THRESHOLD_SECONDS > userDeadline
      if (deadlineLessThanThreshold) {
        console.log(
          '[EthFlowDeadlineUpdater] - Setting user deadline to minimum threshold of 10 minutes',
          isEthFlow,
          userDeadline,
          deadlineLessThanThreshold
        )
        _saveDeadlineToStorage(userDeadline)
        setUserDeadline(DEADLINE_LOWER_THRESHOLD_SECONDS)
      }
    } else if (mounted) {
      _parsePreviousDeadlineFromStorageSet(setUserDeadline)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEthFlow])

  return null
}

function _saveDeadlineToStorage(currentUserDeadline: number) {
  return localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUserDeadline))
}

function _parsePreviousDeadlineFromStorage(): number | null {
  const previousDeadlineStorage = localStorage.getItem(STORAGE_KEY)

  return previousDeadlineStorage ? +JSON.parse(previousDeadlineStorage) : null
}

function _parsePreviousDeadlineFromStorageSet(setUserDeadline: (slippage: number) => void) {
  const parsedDeadline = _parsePreviousDeadlineFromStorage()
  // user switched back to non-native swap, set deadline back to previous value
  parsedDeadline && setUserDeadline(parsedDeadline)
}
