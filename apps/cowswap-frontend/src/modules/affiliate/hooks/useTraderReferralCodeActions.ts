import { TraderReferralCodeActions } from '../lib/affiliateProgramTypes'
import { useTraderReferralCodeContext } from '../state/TraderReferralCodeContext'

export function useTraderReferralCodeActions(): TraderReferralCodeActions {
  return useTraderReferralCodeContext().actions
}
