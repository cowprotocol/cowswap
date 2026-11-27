import { useRemainingSeconds, useTimeAgo } from '@cowprotocol/common-hooks'

import { useLingui } from '@lingui/react/macro'

import { OrderStatus } from 'legacy/state/orders/actions'

export function useOrderCreationTime(
  creationTime: Date,
  status: OrderStatus,
): { isScheduledCreating: boolean; creationTimeAgo: string } {
  const isScheduled = status === OrderStatus.SCHEDULED
  const remainingSeconds = useRemainingSeconds(isScheduled ? creationTime.getTime() : null)
  const timeAgo = useTimeAgo(creationTime)
  const { i18n } = useLingui()

  return {
    isScheduledCreating: remainingSeconds === 0,
    creationTimeAgo:
      remainingSeconds !== undefined && remainingSeconds > 0 && remainingSeconds < 60
        ? new Intl.RelativeTimeFormat(i18n.locale).format(remainingSeconds, 'second')
        : timeAgo,
  }
}
