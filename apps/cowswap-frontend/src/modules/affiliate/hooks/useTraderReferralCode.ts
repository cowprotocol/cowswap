import { TraderReferralCodeContextValue } from '../lib/affiliateProgramTypes'
import { useTraderReferralCodeContext } from '../state/TraderReferralCodeContext'

export function useTraderReferralCode(): TraderReferralCodeContextValue {
  return useTraderReferralCodeContext()
}
