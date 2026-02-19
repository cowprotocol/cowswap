import { ReactNode } from 'react'

import { useRecoverTraderReferralCode } from '../hooks/useRecoverTraderReferralCode'

export function AffiliateTraderRecoverySideEffect(): ReactNode {
  useRecoverTraderReferralCode()

  return null
}
