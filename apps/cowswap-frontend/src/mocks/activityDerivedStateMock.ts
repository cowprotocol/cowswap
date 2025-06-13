import { ActivityDerivedState, ActivityStatus, ActivityType } from '../common/types/activity'

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
