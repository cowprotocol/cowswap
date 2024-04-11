import { ActivityStatus, ActivityType } from 'legacy/hooks/useRecentActivity'

import { ActivityDerivedState } from 'modules/account/containers/Transaction'

export const activityDerivedStateMock: ActivityDerivedState = {
  id: '0x11',
  status: ActivityStatus.PENDING,
  type: ActivityType.ORDER,
  summary: '',
  activityLinkUrl: '',
  isTransaction: false,
  isOrder: false,
  isPending: false,
  isConfirmed: false,
  isExpired: false,
  isCancelling: false,
  isCancelled: false,
  isPresignaturePending: false,
  isUnfillable: false,
  isCreating: false,
  isFailed: false,
  isReplaced: false,
}
