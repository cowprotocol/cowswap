import { useAtomValue } from 'jotai'
import { ReactNode } from 'react'

import { PAGE_TITLES } from '@cowprotocol/common-const'

import { useLingui } from '@lingui/react/macro'

import {
  AffiliateTraderCodeInfo,
  AffiliateTraderNextPayout,
  AffiliateTraderOnboard,
  AffiliateTraderStats,
  TraderWalletStatus,
  useAffiliateTraderWallet,
  AffiliateTraderIneligible,
  AffiliateTraderUnsupportedNetwork,
  ThreeColumnGrid,
  PageWrapper,
  UnsupportedNetwork,
  affiliateTraderSavedCodeAtom,
} from 'modules/affiliate'
import { PageTitle } from 'modules/application/containers/PageTitle'

export default function AffiliateTrader(): ReactNode {
  const { i18n } = useLingui()

  const { savedCode } = useAtomValue(affiliateTraderSavedCodeAtom)
  const walletStatus = useAffiliateTraderWallet()

  return (
    <>
      {walletStatus === TraderWalletStatus.UNSUPPORTED && <UnsupportedNetwork />}
      <PageWrapper>
        <PageTitle title={i18n._(PAGE_TITLES.MY_REWARDS)} />

        {walletStatus === TraderWalletStatus.INELIGIBLE ? (
          <AffiliateTraderIneligible />
        ) : walletStatus === TraderWalletStatus.UNSUPPORTED ? (
          <AffiliateTraderUnsupportedNetwork />
        ) : !savedCode || walletStatus === TraderWalletStatus.DISCONNECTED ? (
          <AffiliateTraderOnboard />
        ) : (
          <>
            <ThreeColumnGrid>
              <AffiliateTraderCodeInfo />
              <AffiliateTraderStats />
              <AffiliateTraderNextPayout />
            </ThreeColumnGrid>
          </>
        )}
      </PageWrapper>
    </>
  )
}
