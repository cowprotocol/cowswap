import { useAtomValue } from 'jotai'
import { ReactNode } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { Trans } from '@lingui/react/macro'

import { useAffiliateTraderStats } from 'modules/affiliate/hooks/useAffiliateTraderStats'
import {
  formatUsdcCompact,
  formatUsdCompact,
  getProgressToNextReward,
  getReferralTrafficPercent,
} from 'modules/affiliate/lib/affiliateProgramUtils'
import { MetricsCard, MetricsCardItem } from 'modules/affiliate/pure/MetricsCard'
import { affiliateTraderAtom } from 'modules/affiliate/state/affiliateTraderAtom'

export function AffiliateTraderStats(): ReactNode {
  const { account } = useWalletInfo()
  const affiliateTrader = useAtomValue(affiliateTraderAtom)
  const { data: stats, isLoading } = useAffiliateTraderStats(account)
  const { verificationProgramParams: programParams } = affiliateTrader

  const rewardAmountLabel = programParams ? formatUsdCompact(programParams.traderRewardAmount) : 'reward'
  const triggerVolume = typeof programParams?.triggerVolumeUsd === 'number' ? programParams.triggerVolumeUsd : null
  const progressToNextReward = getProgressToNextReward(triggerVolume, stats?.left_to_next_rewards)
  const rewardsProgressPercent = getReferralTrafficPercent(triggerVolume, progressToNextReward)
  const rewardsProgressLabel = triggerVolume !== null ? formatUsdCompact(progressToNextReward) : formatUsdCompact(0)
  const items: MetricsCardItem[] = [
    {
      label: <Trans>Left to next {rewardAmountLabel}</Trans>,
      value: formatUsdCompact(stats?.left_to_next_rewards),
    },
    { label: <Trans>Total earned</Trans>, value: formatUsdcCompact(stats?.total_earned) },
    { label: <Trans>Received</Trans>, value: formatUsdcCompact(stats?.paid_out) },
  ]
  const donutHint =
    triggerVolume !== null ? (
      <>
        <Trans>of</Trans> {formatUsdCompact(triggerVolume)}
      </>
    ) : undefined

  return (
    <MetricsCard
      showLoader={isLoading}
      title={<Trans>Next {rewardAmountLabel} reward</Trans>}
      items={items}
      donutValue={rewardsProgressPercent}
      donutLabel={rewardsProgressLabel}
      donutHint={donutHint}
    />
  )
}
