import { ReactNode } from 'react'

import { PAGE_TITLES } from '@cowprotocol/common-const'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useLingui } from '@lingui/react/macro'

import {
  AffiliatePartnerCodeCreation,
  AffiliatePartnerCodeInfo,
  AffiliatePartnerNextPayout,
  AffiliatePartnerOnboard,
  AffiliatePartnerStats,
  useAffiliatePartnerInfo,
  isSupportedPayoutsNetwork,
  AffiliateTermsFaqLinks,
  ColumnOneCard,
  ThreeColumnGrid,
  PageWrapper,
} from 'modules/affiliate'
import { isSupportedTradingNetwork } from 'modules/affiliate/lib/affiliateProgramUtils'
import { PageTitle } from 'modules/application'

export default function AffiliatePartner(): ReactNode {
  const { i18n } = useLingui()
  const { account, chainId } = useWalletInfo()
  const { data: partnerInfo, isLoading: infoLoading } = useAffiliatePartnerInfo(account)

  return (
    <PageWrapper>
      <PageTitle title={i18n._(PAGE_TITLES.AFFILIATE)} />

      {!account ||
      (!isSupportedPayoutsNetwork(chainId) && !partnerInfo && !infoLoading) ||
      !isSupportedTradingNetwork(chainId) ? (
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
