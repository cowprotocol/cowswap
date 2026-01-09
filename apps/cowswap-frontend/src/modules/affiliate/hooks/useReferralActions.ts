import { useReferralContext } from '../state/ReferralContext'
import { ReferralActions } from '../types'

export function useReferralActions(): ReferralActions {
  return useReferralContext().actions
}
