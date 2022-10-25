import { useEffect } from 'react'
import { useUserTransactionTTL } from 'state/user/hooks'
import { useIsEthFlow } from '@cow/modules/swap/hooks/useIsEthFlow'

// 10 minutes in SECONDS
export const DEADLINE_LOWER_THRESHOLD_SECONDS = 600

export function EthFlowDeadlineUpdater() {
  // USER DEADLINE (IN SECONDS)
  const [userDeadline, setUserDeadline] = useUserTransactionTTL()
  const isEthFlow = useIsEthFlow()

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
        setUserDeadline(DEADLINE_LOWER_THRESHOLD_SECONDS)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEthFlow, userDeadline])

  return null
}
