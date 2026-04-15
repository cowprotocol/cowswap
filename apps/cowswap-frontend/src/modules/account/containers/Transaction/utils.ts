import { ActivityDerivedState } from 'common/types/activity'

const PILL_COLOUR_MAP = {
  SUCCESS: 'success',
  PENDING: 'pending',
  OPEN: 'open',
  ALERT: 'alert',
  DANGER: 'danger',
} as const

export function determinePillColour({
  isLoading,
  isConfirmed,
  isExpired,
  isCancelling,
  isCancelled,
  isFailed,
}: ActivityDerivedState): string {
  if (isLoading) return PILL_COLOUR_MAP.OPEN

  if (isCancelling || isCancelled || isFailed) return PILL_COLOUR_MAP.DANGER

  if (isConfirmed) return PILL_COLOUR_MAP.SUCCESS

  if (isExpired) return PILL_COLOUR_MAP.ALERT

  return PILL_COLOUR_MAP.PENDING
}
