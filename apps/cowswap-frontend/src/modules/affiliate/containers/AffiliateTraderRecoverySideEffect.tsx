import { useAtomValue } from 'jotai'
import { ReactNode } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { useRecoverTraderReferralCode } from '../hooks/useRecoverTraderReferralCode'
import { affiliateTraderAtom } from '../state/affiliateTraderAtom'

export function AffiliateTraderRecoverySideEffect(): ReactNode {
  const { account } = useWalletInfo()
  const affiliateTrader = useAtomValue(affiliateTraderAtom)

  useRecoverTraderReferralCode({
    account,
    savedCode: affiliateTrader.savedCode,
  })

  return null
}
