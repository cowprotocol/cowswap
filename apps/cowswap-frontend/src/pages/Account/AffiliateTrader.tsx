import { useAtomValue, useSetAtom } from 'jotai'
import { ReactNode } from 'react'

import { PAGE_TITLES } from '@cowprotocol/common-const'
import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletChainId } from '@cowprotocol/wallet-provider'

import { useLingui } from '@lingui/react/macro'

import { useToggleWalletModal } from 'legacy/state/application/hooks'

import { useAffiliateTraderRewardsStats } from 'modules/affiliate/hooks/useAffiliateTraderRewardsStats'
import { TraderWalletStatus, useAffiliateTraderWallet } from 'modules/affiliate/hooks/useAffiliateTraderWallet'
import { AffiliateTraderCodeCard } from 'modules/affiliate/pure/AffiliateTrader/AffiliateTraderCodeCard'
import { AffiliateTraderHistory } from 'modules/affiliate/pure/AffiliateTrader/AffiliateTraderHistory'
import { AffiliateTraderIneligible } from 'modules/affiliate/pure/AffiliateTrader/AffiliateTraderIneligible'
import { AffiliateTraderMetricsCard } from 'modules/affiliate/pure/AffiliateTrader/AffiliateTraderMetricsCard'
import { AffiliateTraderNextPayoutCard } from 'modules/affiliate/pure/AffiliateTrader/AffiliateTraderNextPayoutCard'
import { AffiliateTraderOnboard } from 'modules/affiliate/pure/AffiliateTrader/AffiliateTraderOnboard'
import { AffiliateTraderUnsupportedNetwork } from 'modules/affiliate/pure/AffiliateTrader/AffiliateTraderUnsupportedNetwork'
import { ThreeColumnGrid, PageWrapper } from 'modules/affiliate/pure/shared'
import { UnsupportedNetwork } from 'modules/affiliate/pure/UnsupportedNetwork'
import { affiliateTraderAtom } from 'modules/affiliate/state/affiliateTraderAtom'
import { openTraderReferralCodeModalAtom } from 'modules/affiliate/state/affiliateTraderWriteAtoms'
import { PageTitle } from 'modules/application/containers/PageTitle'

export default function AffiliateTrader(): ReactNode {
  const { i18n } = useLingui()
  const { account } = useWalletInfo()
  const chainId = useWalletChainId()
  const toggleWalletModal = useToggleWalletModal()
  const affiliateTrader = useAtomValue(affiliateTraderAtom)
  const openModal = useSetAtom(openTraderReferralCodeModalAtom)

  const { walletStatus, linkedCode, supportedNetwork } = useAffiliateTraderWallet({
    account,
    chainId,
    savedCode: affiliateTrader.savedCode,
  })
  const isUnsupportedNetwork = !!account && !supportedNetwork
  const incomingIneligibleCode =
    affiliateTrader.incomingCode ||
    (affiliateTrader.verification.kind === 'ineligible' ? affiliateTrader.verification.code : undefined)
  const { traderStats, loading } = useAffiliateTraderRewardsStats({
    account,
    currentSavedCode: affiliateTrader.savedCode,
  })

  const statsLinkedCode = traderStats?.bound_referrer_code
  const linkedWalletCode = walletStatus === TraderWalletStatus.LINKED ? linkedCode : undefined
  const isIneligible = walletStatus === TraderWalletStatus.INELIGIBLE && !statsLinkedCode
  const traderCode =
    walletStatus === TraderWalletStatus.DISCONNECTED
      ? undefined
      : (statsLinkedCode ?? linkedWalletCode ?? affiliateTrader.savedCode)

  return (
    <>
      {walletStatus === TraderWalletStatus.UNSUPPORTED && <UnsupportedNetwork />}
      <PageWrapper>
        <PageTitle title={i18n._(PAGE_TITLES.MY_REWARDS)} />

        {isIneligible ? (
          <AffiliateTraderIneligible incomingIneligibleCode={incomingIneligibleCode} />
        ) : isUnsupportedNetwork ? (
          <AffiliateTraderUnsupportedNetwork />
        ) : !traderCode ? (
          <AffiliateTraderOnboard onConnect={toggleWalletModal} onAddCode={() => openModal()} />
        ) : (
          <>
            <ThreeColumnGrid>
              <AffiliateTraderCodeCard
                loading={loading}
                walletStatus={walletStatus}
                linkedCode={linkedCode}
                savedCode={affiliateTrader.savedCode}
                traderStats={traderStats}
                onEditCode={() => openModal()}
              />
              <AffiliateTraderMetricsCard
                loading={loading}
                traderStats={traderStats}
                verification={affiliateTrader.verification}
              />
              <AffiliateTraderNextPayoutCard loading={loading} traderStats={traderStats} />
            </ThreeColumnGrid>
            <AffiliateTraderHistory account={account} traderStats={traderStats} />
          </>
        )}
      </PageWrapper>
    </>
  )
}
