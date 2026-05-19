import { useAtomValue } from 'jotai'
import { ReactNode } from 'react'

import { PAGE_TITLES } from '@cowprotocol/common-const'
import { useIsRestoringConnection } from '@cowprotocol/wallet'

import { useLingui } from '@lingui/react/macro'

import {
  AffiliateTraderCodeInfo,
  AffiliateTraderExpiryBanner,
  AffiliateTraderLoading,
  AffiliateTraderNextPayout,
  AffiliateTraderOnboard,
  AffiliateTraderStats,
  TraderWalletStatus,
  getAffiliateTraderPageState,
  useAffiliateStateViewAnalytics,
  useAffiliateTraderWallet,
  AffiliateTraderIneligible,
  AffiliateTraderUnsupportedNetwork,
  ThreeColumnGrid,
  PageWrapper,
  UnsupportedNetwork,
  affiliateTraderSavedCodeAtom,
} from 'modules/affiliate'
import { PageTitle } from 'modules/application'

import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'

export default function AffiliateTrader(): ReactNode {
  const { i18n } = useLingui()

  const { savedCode } = useAtomValue(affiliateTraderSavedCodeAtom)
  const walletStatus = useAffiliateTraderWallet()
  const hasSavedCode = !!savedCode
  const pageState = getAffiliateTraderPageState(walletStatus, hasSavedCode)
  const isProviderNetworkUnsupported = useIsProviderNetworkUnsupported()
  const isConnectionRestoring = useIsRestoringConnection()
  const showLoadingSkeleton = isConnectionRestoring || walletStatus === TraderWalletStatus.PENDING

  useAffiliateStateViewAnalytics({
    action: 'affiliate_trader_page_state_viewed',
    viewKey: pageState,
    eventParams: {
      pageState,
      walletStatus,
      hasSavedCode,
    },
  })

  // Only show the local affiliate banner when the chain is supported by the app
  // but not eligible for rewards (e.g. Sepolia). When the chain is globally
  // unsupported, the app-level banner already covers it.
  const showAffiliateBanner = walletStatus === TraderWalletStatus.UNSUPPORTED && !isProviderNetworkUnsupported

  return (
    <>
      {showAffiliateBanner && <UnsupportedNetwork />}
      <PageWrapper>
        <PageTitle title={i18n._(PAGE_TITLES.MY_REWARDS)} />

        {walletStatus === TraderWalletStatus.INELIGIBLE ? (
          <AffiliateTraderIneligible />
        ) : walletStatus === TraderWalletStatus.UNSUPPORTED ? (
          <AffiliateTraderUnsupportedNetwork />
        ) : showLoadingSkeleton ? (
          <AffiliateTraderLoading />
        ) : !savedCode || walletStatus === TraderWalletStatus.DISCONNECTED ? (
          <AffiliateTraderOnboard />
        ) : (
          <>
            <AffiliateTraderExpiryBanner />
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
