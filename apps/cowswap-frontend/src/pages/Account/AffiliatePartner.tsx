import { ReactNode } from 'react'

import { PAGE_TITLES } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useLingui } from '@lingui/react/macro'

import { AffiliatePartnerCodeCreation } from 'modules/affiliate/containers/AffiliatePartnerCodeCreation'
import { AffiliatePartnerCodeInfo } from 'modules/affiliate/containers/AffiliatePartnerCodeInfo'
import { AffiliatePartnerNextPayout } from 'modules/affiliate/containers/AffiliatePartnerNextPayout'
import { AffiliatePartnerOnboard } from 'modules/affiliate/containers/AffiliatePartnerOnboard'
import { AffiliatePartnerPayoutHistory } from 'modules/affiliate/containers/AffiliatePartnerPayoutHistory'
import { AffiliatePartnerStats } from 'modules/affiliate/containers/AffiliatePartnerStats'
import { useAffiliatePartnerInfo } from 'modules/affiliate/hooks/useAffiliatePartnerInfo'
import { AffiliateTermsFaqLinks, ColumnOneCard, ThreeColumnGrid, PageWrapper } from 'modules/affiliate/pure/shared'
import { PageTitle } from 'modules/application/containers/PageTitle'

export default function AffiliatePartner(): ReactNode {
  const { i18n } = useLingui()
  const { account, chainId } = useWalletInfo()
  const isUnsupported = !!account && chainId !== SupportedChainId.MAINNET

  const { data: partnerInfo, isLoading: codeLoading } = useAffiliatePartnerInfo(account)
  const refCode = partnerInfo?.code

  const showOnboard = !account || isUnsupported || !refCode
  const showCodeInfo = !!account && chainId === SupportedChainId.MAINNET && !!refCode

  return (
    <PageWrapper>
      <PageTitle title={i18n._(PAGE_TITLES.AFFILIATE)} />

      {showOnboard ? (
        <AffiliatePartnerOnboard />
      ) : (
        <>
          <ThreeColumnGrid>
            <ColumnOneCard showLoader={codeLoading}>
              {showCodeInfo ? <AffiliatePartnerCodeInfo /> : <AffiliatePartnerCodeCreation />}
            </ColumnOneCard>
            <AffiliatePartnerStats />
            <AffiliatePartnerNextPayout />
          </ThreeColumnGrid>
          <AffiliatePartnerPayoutHistory />
          <AffiliateTermsFaqLinks align="center" />
        </>
      )}
    </PageWrapper>
  )
}
