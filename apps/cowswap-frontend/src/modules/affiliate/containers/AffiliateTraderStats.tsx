import { useAtomValue } from 'jotai'
import { ReactNode } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { Trans } from '@lingui/react/macro'

import { useAffiliateTraderStats } from '../hooks/useAffiliateTraderStats'
import {
  formatUsdcCompact,
  formatUsdCompact,
  getProgressToNextReward,
  getReferralTrafficPercent,
} from '../lib/affiliateProgramUtils'
import { MetricsCard } from '../pure/MetricsCard'
import { affiliateTraderAtom } from '../state/affiliateTraderAtom'

export function AffiliateTraderStats(): ReactNode {
  const { account } = useWalletInfo()
  const affiliateTrader = useAtomValue(affiliateTraderAtom)
  const { data: stats, isLoading } = useAffiliateTraderStats(account)
  const { verificationProgramParams: programParams } = affiliateTrader

  const rewardAmountLabel = programParams ? formatUsdCompact(programParams.traderRewardAmount) : 'reward'
  const progressToNextReward = getProgressToNextReward(programParams?.triggerVolumeUsd, stats?.left_to_next_rewards)

  return (
    <MetricsCard
      showLoader={isLoading}
      title={<Trans>Next {rewardAmountLabel} reward</Trans>}
      items={[
        {
          label: <Trans>Left to next {rewardAmountLabel}</Trans>,
          value: formatUsdCompact(stats?.left_to_next_rewards),
        },
        { label: <Trans>Total earned</Trans>, value: formatUsdcCompact(stats?.total_earned) },
        { label: <Trans>Received</Trans>, value: formatUsdcCompact(stats?.paid_out) },
      ]}
      donutValue={getReferralTrafficPercent(programParams?.triggerVolumeUsd, progressToNextReward)}
      donutLabel={formatUsdCompact(progressToNextReward)}
      donutSubtitle={
        programParams?.triggerVolumeUsd && (
          <>
            <Trans>of</Trans> {formatUsdCompact(programParams.triggerVolumeUsd)}
          </>
        )
      }
    />
  )
}
