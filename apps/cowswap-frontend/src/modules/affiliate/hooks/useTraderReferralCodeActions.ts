import { TraderReferralCodeActions } from '../state/affiliate-program-types'
import { useTraderReferralCodeContext } from '../state/TraderReferralCodeContext'

export function useTraderReferralCodeActions(): TraderReferralCodeActions {
  return useTraderReferralCodeContext().actions
}
