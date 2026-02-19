import { useAtomValue } from 'jotai'
import { ReactNode } from 'react'

import { PAGE_TITLES } from '@cowprotocol/common-const'

import { useLingui } from '@lingui/react/macro'

import { AffiliateTraderCodeInfo } from 'modules/affiliate/containers/AffiliateTraderCodeInfo'
import { AffiliateTraderNextPayout } from 'modules/affiliate/containers/AffiliateTraderNextPayout'
import { AffiliateTraderOnboard } from 'modules/affiliate/containers/AffiliateTraderOnboard'
import { AffiliateTraderStats } from 'modules/affiliate/containers/AffiliateTraderStats'
import { TraderWalletStatus, useAffiliateTraderWallet } from 'modules/affiliate/hooks/useAffiliateTraderWallet'
import { AffiliateTraderIneligible } from 'modules/affiliate/pure/AffiliateTrader/AffiliateTraderIneligible'
import { AffiliateTraderUnsupportedNetwork } from 'modules/affiliate/pure/AffiliateTrader/AffiliateTraderUnsupportedNetwork'
import { ThreeColumnGrid, PageWrapper } from 'modules/affiliate/pure/shared'
import { UnsupportedNetwork } from 'modules/affiliate/pure/UnsupportedNetwork'
import { affiliateTraderAtom } from 'modules/affiliate/state/affiliateTraderAtom'
import { PageTitle } from 'modules/application/containers/PageTitle'

export default function AffiliateTrader(): ReactNode {
  const { i18n } = useLingui()

  const { savedCode, codeInput } = useAtomValue(affiliateTraderAtom)
  const { walletStatus } = useAffiliateTraderWallet()

  return (
    <>
      {walletStatus === TraderWalletStatus.UNSUPPORTED && <UnsupportedNetwork />}
      <PageWrapper>
        <PageTitle title={i18n._(PAGE_TITLES.MY_REWARDS)} />

        {walletStatus === TraderWalletStatus.INELIGIBLE ? (
          <AffiliateTraderIneligible refCode={codeInput} />
        ) : walletStatus === TraderWalletStatus.UNSUPPORTED ? (
          <AffiliateTraderUnsupportedNetwork />
        ) : !savedCode ? (
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
