import { ReactNode } from 'react'

import { PAGE_TITLES } from '@cowprotocol/common-const'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useLingui } from '@lingui/react/macro'

import { AffiliatePartnerCodeCreation } from 'modules/affiliate/containers/AffiliatePartnerCodeCreation'
import { AffiliatePartnerCodeInfo } from 'modules/affiliate/containers/AffiliatePartnerCodeInfo'
import { AffiliatePartnerNextPayout } from 'modules/affiliate/containers/AffiliatePartnerNextPayout'
import { AffiliatePartnerOnboard } from 'modules/affiliate/containers/AffiliatePartnerOnboard'
import { AffiliatePartnerStats } from 'modules/affiliate/containers/AffiliatePartnerStats'
import { useAffiliatePartnerInfo } from 'modules/affiliate/hooks/useAffiliatePartnerInfo'
import { isSupportedPayoutsNetwork } from 'modules/affiliate/lib/affiliateProgramUtils'
import { AffiliateTermsFaqLinks, ColumnOneCard, ThreeColumnGrid, PageWrapper } from 'modules/affiliate/pure/shared'
import { PageTitle } from 'modules/application/containers/PageTitle'

export default function AffiliatePartner(): ReactNode {
  const { i18n } = useLingui()
  const { account, chainId } = useWalletInfo()
  const { data: partnerInfo, isLoading: codeLoading } = useAffiliatePartnerInfo(account)

  return (
    <PageWrapper>
      <PageTitle title={i18n._(PAGE_TITLES.AFFILIATE)} />

      {!account || !isSupportedPayoutsNetwork(chainId) ? (
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
