import { ActivityState } from 'legacy/hooks/useActivityDerivedState'

import { ActivityStatus, ActivityType } from 'common/types/activity'

const PILL_COLOUR_MAP = {
  CONFIRMED: 'success',
  PENDING_ORDER: ActivityState.PENDING,
  PRESIGNATURE_PENDING: ActivityState.PENDING,
  CREATING: ActivityState.PENDING,
  PENDING_TX: ActivityState.PENDING,
  LOADING: ActivityState.OPEN,
  EXPIRED_ORDER: 'alert',
  CANCELLED_ORDER: 'danger',
  CANCELLING_ORDER: 'danger',
  FAILED: 'danger',
}

// eslint-disable-next-line complexity
export function determinePillColour(status: ActivityStatus, type: ActivityType): string {
  const isOrder = type === ActivityType.ORDER

  switch (status) {
    case ActivityStatus.PENDING:
      return isOrder ? PILL_COLOUR_MAP.PENDING_ORDER : PILL_COLOUR_MAP.PENDING_TX
    case ActivityStatus.PRESIGNATURE_PENDING:
      return PILL_COLOUR_MAP.PRESIGNATURE_PENDING
    case ActivityStatus.CONFIRMED:
      return PILL_COLOUR_MAP.CONFIRMED
    case ActivityStatus.EXPIRED:
      return PILL_COLOUR_MAP.EXPIRED_ORDER
    case ActivityStatus.CANCELLING:
      return PILL_COLOUR_MAP.CANCELLING_ORDER
    case ActivityStatus.CANCELLED:
      return PILL_COLOUR_MAP.CANCELLED_ORDER
    case ActivityStatus.CREATING:
      return PILL_COLOUR_MAP.CREATING
    case ActivityStatus.FAILED:
      return PILL_COLOUR_MAP.FAILED
    case ActivityStatus.LOADING:
      return PILL_COLOUR_MAP.LOADING
  }
}
