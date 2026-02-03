import { TraderReferralCodeContextValue } from '../partner-trader-types'
import { useTraderReferralCodeContext } from '../state/TraderReferralCodeContext'

export function useTraderReferralCode(): TraderReferralCodeContextValue {
  return useTraderReferralCodeContext()
}
