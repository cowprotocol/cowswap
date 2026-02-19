import type { ReactNode } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import { useAffiliatePartnerInfo } from 'modules/affiliate/hooks/useAffiliatePartnerInfo'
import { useAffiliatePartnerStats } from 'modules/affiliate/hooks/useAffiliatePartnerStats'
import {
  formatUsdCompact,
  formatUsdcCompact,
  getProgressToNextReward,
  getReferralTrafficPercent,
  getRewardAmountLabel,
} from 'modules/affiliate/lib/affiliateProgramUtils'
import { MetricsCard, MetricsCardItem } from 'modules/affiliate/pure/MetricsCard'

export function AffiliatePartnerStats(): ReactNode {
  const { account } = useWalletInfo()
  const { data: info, isLoading: codeLoading } = useAffiliatePartnerInfo(account)
  const { data: stats, isLoading: statsLoading } = useAffiliatePartnerStats(account, info?.code)

  const referralTrafficTooltip = t`This chart tracks eligible volume left to unlock the next reward.`
  const rewardAmountLabel = getRewardAmountLabel(info ?? null)
  const triggerVolume = typeof info?.triggerVolume === 'number' ? info.triggerVolume : null
  const progressToNextReward = getProgressToNextReward(triggerVolume, stats?.left_to_next_reward)

  const referralTrafficPercent = getReferralTrafficPercent(triggerVolume, progressToNextReward)

  const items: MetricsCardItem[] = [
    {
      label: <Trans>Left to next {rewardAmountLabel}</Trans>,
      value: formatUsdCompact(stats?.left_to_next_reward),
      labelTooltip: referralTrafficTooltip,
    },
    {
      label: <Trans>Total earned</Trans>,
      value: formatUsdcCompact(stats?.total_earned),
    },
    {
      label: <Trans>Received</Trans>,
      value: formatUsdcCompact(stats?.paid_out),
    },
    {
      label: <Trans>Volume referred</Trans>,
      value: formatUsdCompact(stats?.total_volume),
    },
    {
      label: <Trans>Active referrals</Trans>,
      value: typeof stats?.active_traders === 'number' ? `${stats.active_traders}` : '-',
    },
  ]
  const donutHint =
    triggerVolume !== null ? (
      <>
        <Trans>of</Trans> {formatUsdCompact(triggerVolume)}
      </>
    ) : undefined

  return (
    <MetricsCard
      showLoader={codeLoading || statsLoading}
      title={<Trans>Your referral traffic</Trans>}
      titleTooltip={referralTrafficTooltip}
      items={items}
      donutValue={referralTrafficPercent}
      donutLabel={formatUsdCompact(progressToNextReward)}
      donutHint={donutHint}
    />
  )
}
