import { TraderReferralCodeActions } from '../partner-trader-types'
import { useTraderReferralCodeContext } from '../state/TraderReferralCodeContext'

export function useTraderReferralCodeActions(): TraderReferralCodeActions {
  return useTraderReferralCodeContext().actions
}
