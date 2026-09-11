import { useMachineTimeMs, useTimeAgo } from '@cowprotocol/common-hooks'

import { useLingui } from '@lingui/react/macro'

import { OrderStatus } from 'legacy/state/orders/actions'

export function useOrderCreationTime(
  creationTime: Date,
  status: OrderStatus,
): { isScheduledCreating: boolean; creationTimeAgo: string } {
  const now = useMachineTimeMs(1000)
  const timeAgo = useTimeAgo(creationTime)
  const { i18n } = useLingui()
  const remainingSeconds = Math.ceil((creationTime.getTime() - now) / 1000)
  const isScheduled = status === OrderStatus.SCHEDULED

  return {
    isScheduledCreating: isScheduled && remainingSeconds <= 0,
    creationTimeAgo:
      isScheduled && remainingSeconds > 0 && remainingSeconds < 60
        ? new Intl.RelativeTimeFormat(i18n.locale).format(remainingSeconds, 'second')
        : timeAgo,
  }
}
