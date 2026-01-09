import { useReferralContext } from '../state/ReferralContext'
import { ReferralContextValue } from '../types'

export function useReferral(): ReferralContextValue {
  return useReferralContext()
}
