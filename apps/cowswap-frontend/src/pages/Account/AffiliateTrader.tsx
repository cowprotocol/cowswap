import { useAtomValue } from 'jotai'
import { ReactNode } from 'react'

import { PAGE_TITLES } from '@cowprotocol/common-const'

import { useLingui } from '@lingui/react/macro'

import {
  AffiliateTraderCodeInfo,
  AffiliateTraderExpiryBanner,
  AffiliateTraderLoading,
  AffiliateTraderNextPayout,
  AffiliateTraderOnboard,
  AffiliateTraderActivityTable,
  AffiliateTraderStats,
  TraderWalletStatus,
  getAffiliateTraderPageState,
  useAffiliateStateViewAnalytics,
  useAffiliateTraderWallet,
  useTraderActivity,
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
  const { data: activityOrders, isLoading: activityLoading } = useTraderActivity()

  return (
    <>
      {showAffiliateBanner && <UnsupportedNetwork />}
      <PageWrapper>
        <PageTitle title={i18n._(PAGE_TITLES.MY_REWARDS)} />

        {walletStatus === TraderWalletStatus.INELIGIBLE ? (
          <AffiliateTraderIneligible />
        ) : walletStatus === TraderWalletStatus.UNSUPPORTED ? (
          <AffiliateTraderUnsupportedNetwork />
        ) : walletStatus === TraderWalletStatus.PENDING ? (
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
            <AffiliateTraderActivityTable
              orders={activityOrders || []}
              savedCode={savedCode}
              showLoader={activityLoading}
            />
          </>
        )}
      </PageWrapper>
    </>
  )
}
