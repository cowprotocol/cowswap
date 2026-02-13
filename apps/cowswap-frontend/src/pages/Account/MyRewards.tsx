import { useAtomValue, useSetAtom } from 'jotai'
import { ReactNode } from 'react'

import { PAGE_TITLES } from '@cowprotocol/common-const'
import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletChainId } from '@cowprotocol/wallet-provider'

import { useLingui } from '@lingui/react/macro'

import { useToggleWalletModal } from 'legacy/state/application/hooks'

import { useAffiliateTraderRewardsStats } from 'modules/affiliate/hooks/useAffiliateTraderRewardsStats'
import { TraderWalletStatus, useAffiliateTraderWallet } from 'modules/affiliate/hooks/useAffiliateTraderWallet'
import { MyRewardsCodeCard } from 'modules/affiliate/pure/AffiliateTrader/MyRewardsCodeCard'
import { MyRewardsHistorySection } from 'modules/affiliate/pure/AffiliateTrader/MyRewardsHistorySection'
import { MyRewardsIneligible } from 'modules/affiliate/pure/AffiliateTrader/MyRewardsIneligible'
import { MyRewardsMetricsCard } from 'modules/affiliate/pure/AffiliateTrader/MyRewardsMetricsCard'
import { MyRewardsNextPayoutCard } from 'modules/affiliate/pure/AffiliateTrader/MyRewardsNextPayoutCard'
import { MyRewardsNoTraderCode } from 'modules/affiliate/pure/AffiliateTrader/MyRewardsNoTraderCode'
import { MyRewardsUnsupportedNetwork } from 'modules/affiliate/pure/AffiliateTrader/MyRewardsUnsupportedNetwork'
import { RewardsThreeColumnGrid, RewardsWrapper } from 'modules/affiliate/pure/shared'
import { UnsupportedNetwork } from 'modules/affiliate/pure/UnsupportedNetwork'
import { affiliateTraderAtom } from 'modules/affiliate/state/affiliateTraderAtom'
import { openTraderReferralCodeModalAtom } from 'modules/affiliate/state/affiliateTraderWriteAtoms'
import { PageTitle } from 'modules/application/containers/PageTitle'

export default function AccountMyRewards(): ReactNode {
  const { i18n } = useLingui()
  const { account } = useWalletInfo()
  const chainId = useWalletChainId()
  const toggleWalletModal = useToggleWalletModal()
  const affiliateTrader = useAtomValue(affiliateTraderAtom)
  const openModal = useSetAtom(openTraderReferralCodeModalAtom)

  const isConnected = Boolean(account)
  const { walletStatus, linkedCode, supportedNetwork } = useAffiliateTraderWallet({
    account,
    chainId,
    savedCode: affiliateTrader.savedCode,
  })
  const isUnsupportedNetwork = Boolean(account) && !supportedNetwork
  const incomingIneligibleCode =
    affiliateTrader.incomingCode ||
    (affiliateTrader.verification.kind === 'ineligible' ? affiliateTrader.verification.code : undefined)
  const { traderStats, loading } = useAffiliateTraderRewardsStats({
    account,
    currentSavedCode: affiliateTrader.savedCode,
  })

  const statsLinkedCode = traderStats?.bound_referrer_code
  const isIneligible = walletStatus === TraderWalletStatus.INELIGIBLE && isConnected && !statsLinkedCode
  const linkedWalletCode = walletStatus === TraderWalletStatus.LINKED ? linkedCode : undefined
  const traderCode = isConnected ? (statsLinkedCode ?? linkedWalletCode ?? affiliateTrader.savedCode) : undefined
  const traderHasCode = Boolean(traderCode)

  return (
    <>
      {walletStatus === TraderWalletStatus.UNSUPPORTED && <UnsupportedNetwork />}
      <RewardsWrapper>
        <PageTitle title={i18n._(PAGE_TITLES.MY_REWARDS)} />

        {isIneligible ? (
          <MyRewardsIneligible incomingIneligibleCode={incomingIneligibleCode} />
        ) : isUnsupportedNetwork ? (
          <MyRewardsUnsupportedNetwork />
        ) : !traderHasCode ? (
          <MyRewardsNoTraderCode
            isConnected={isConnected}
            onConnect={toggleWalletModal}
            onAddCode={() => openModal()}
          />
        ) : (
          <>
            <RewardsThreeColumnGrid>
              <MyRewardsCodeCard
                loading={loading}
                isConnected={isConnected}
                walletStatus={walletStatus}
                linkedCode={linkedCode}
                savedCode={affiliateTrader.savedCode}
                traderStats={traderStats}
                onEditCode={() => openModal()}
              />
              <MyRewardsMetricsCard
                loading={loading}
                traderStats={traderStats}
                verification={affiliateTrader.verification}
              />
              <MyRewardsNextPayoutCard loading={loading} traderStats={traderStats} />
            </RewardsThreeColumnGrid>
            <MyRewardsHistorySection account={account} traderStats={traderStats} />
          </>
        )}
      </RewardsWrapper>
    </>
  )
}
