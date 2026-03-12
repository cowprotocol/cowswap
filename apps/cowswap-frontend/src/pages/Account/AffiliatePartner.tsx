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
import { PageTitle } from 'modules/application'

export default function AffiliatePartner(): ReactNode {
  const { i18n } = useLingui()
  const { account, chainId } = useWalletInfo()
  const { data: partnerInfo, isLoading: codeLoading } = useAffiliatePartnerInfo(account)

  return (
    <PageWrapper>
      <PageTitle title={i18n._(PAGE_TITLES.AFFILIATE)} />

      {!account || (!isSupportedPayoutsNetwork(chainId) && !partnerInfo) ? (
        <AffiliatePartnerOnboard />
      ) : (
        <>
          <ThreeColumnGrid>
            <ColumnOneCard showLoader={codeLoading}>
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
