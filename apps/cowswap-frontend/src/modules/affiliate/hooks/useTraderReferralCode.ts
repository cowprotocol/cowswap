import { TraderReferralCodeContextValue } from '../state/affiliate-program-types'
import { useTraderReferralCodeContext } from '../state/TraderReferralCodeContext'

export function useTraderReferralCode(): TraderReferralCodeContextValue {
  return useTraderReferralCodeContext()
}
