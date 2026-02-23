import { useAtomValue } from 'jotai'
import { ReactNode } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import { useAffiliateTraderInfo } from '../hooks/useAffiliateTraderInfo'
import { useAffiliateTraderStats } from '../hooks/useAffiliateTraderStats'
import {
  formatUsdcCompact,
  formatUsdCompact,
  getProgressToNextReward,
  getReferralTrafficPercent,
} from '../lib/affiliateProgramUtils'
import { MetricsCard } from '../pure/MetricsCard'
import { affiliateTraderSavedCodeAtom } from '../state/affiliateTraderSavedCodeAtom'

export function AffiliateTraderStats(): ReactNode {
  const { account } = useWalletInfo()
  const { savedCode } = useAtomValue(affiliateTraderSavedCodeAtom)
  const { data: info, isLoading: codeLoading } = useAffiliateTraderInfo(savedCode)
  const { data: stats, isLoading: statsLoading } = useAffiliateTraderStats(account)

  const rewardAmountLabel = info ? formatUsdCompact(info.traderRewardAmount) : 'reward'
  const progressToNextReward = getProgressToNextReward(info?.triggerVolume, stats?.left_to_next_rewards)

  return (
    <MetricsCard
      showLoader={codeLoading || statsLoading}
      title={<Trans>Next {rewardAmountLabel} reward</Trans>}
      titleTooltip={t`This chart tracks eligible volume left to unlock the next reward.`}
      items={[
        {
          label: <Trans>Left to next {rewardAmountLabel}</Trans>,
          value: formatUsdCompact(stats?.left_to_next_rewards),
        },
        { label: <Trans>Total earned</Trans>, value: formatUsdcCompact(stats?.total_earned) },
        { label: <Trans>Received</Trans>, value: formatUsdcCompact(stats?.paid_out) },
      ]}
      donutValue={getReferralTrafficPercent(info?.triggerVolume, progressToNextReward)}
      donutLabel={formatUsdCompact(progressToNextReward)}
      donutSubtitle={
        info?.triggerVolume && (
          <>
            <Trans>of</Trans> {formatUsdCompact(info.triggerVolume)}
          </>
        )
      }
    />
  )
}
