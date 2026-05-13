import { ReactNode } from 'react'

import { PAGE_TITLES } from '@cowprotocol/common-const'
import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletChainId } from '@cowprotocol/wallet-provider'

import { useLingui } from '@lingui/react/macro'

import {
  AffiliatePartnerCodeCreation,
  AffiliatePartnerCodeInfo,
  AffiliatePartnerNextPayout,
  AffiliatePartnerOnboard,
  AffiliatePartnerStats,
  AffiliateTermsFaqLinks,
  ColumnOneCard,
  ThreeColumnGrid,
  PageWrapper,
  getAffiliatePartnerPageState,
  isSupportedPayoutsNetwork,
  isSupportedTradingNetwork,
  useAffiliatePartnerInfo,
  useAffiliateStateViewAnalytics,
} from 'modules/affiliate'
import { PageTitle } from 'modules/application'

export default function AffiliatePartner(): ReactNode {
  const { i18n } = useLingui()
  const { account } = useWalletInfo()
  const chainId = useWalletChainId()
  const { data: partnerInfo, isLoading: infoLoading } = useAffiliatePartnerInfo(account)
  const hasAccount = Boolean(account)
  const isSupportedPayoutNetwork = isSupportedPayoutsNetwork(chainId)
  const isSupportedTradingNetworkValue = isSupportedTradingNetwork(chainId)
  const hasExistingCode = Boolean(partnerInfo?.code)
  const pageState = getAffiliatePartnerPageState({
    hasAccount,
    hasExistingCode,
    isLoading: infoLoading,
    isSupportedPayoutNetwork,
    isSupportedTradingNetwork: isSupportedTradingNetworkValue,
  })

  useAffiliateStateViewAnalytics({
    action: 'affiliate_partner_page_state_viewed',
    viewKey: pageState,
    eventParams:
      pageState === undefined
        ? undefined
        : {
            pageState,
            hasAccount,
            isSupportedPayoutNetwork,
            isSupportedTradingNetwork: isSupportedTradingNetworkValue,
            hasExistingCode,
          },
  })

  return (
    <PageWrapper>
      <PageTitle title={i18n._(PAGE_TITLES.AFFILIATE)} />

      {!account || (!isSupportedPayoutNetwork && !partnerInfo && !infoLoading) || !isSupportedTradingNetworkValue ? (
        <AffiliatePartnerOnboard />
      ) : (
        <>
          <ThreeColumnGrid>
            <ColumnOneCard showLoader={infoLoading}>
              {partnerInfo?.code ? <AffiliatePartnerCodeInfo /> : <AffiliatePartnerCodeCreation />}
            </ColumnOneCard>
            <AffiliatePartnerStats />
            <AffiliatePartnerNextPayout />
          </ThreeColumnGrid>
          <AffiliateTermsFaqLinks align="center" />
        </>
      )}
    </PageWrapper>
  )
}
