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

export default function AffiliateTrader(): ReactNode {
  const { i18n } = useLingui()

  const { savedCode } = useAtomValue(affiliateTraderSavedCodeAtom)
  const walletStatus = useAffiliateTraderWallet()
  const { data: activityOrders, isLoading: activityLoading } = useTraderActivity()

  return (
    <>
      {walletStatus === TraderWalletStatus.UNSUPPORTED && <UnsupportedNetwork />}
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
