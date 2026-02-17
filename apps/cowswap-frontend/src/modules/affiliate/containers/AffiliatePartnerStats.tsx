import type { ReactElement } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import { useAffiliatePartnerInfo } from 'modules/affiliate/hooks/useAffiliatePartnerInfo'
import { useAffiliatePartnerStats } from 'modules/affiliate/hooks/useAffiliatePartnerStats'
import {
  formatOptionalAmount,
  formatOptionalInteger,
  formatUsdCompact,
  formatUsdcCompact,
  getProgressToNextReward,
  getReferralTrafficPercent,
  getRewardAmountLabel,
} from 'modules/affiliate/lib/affiliateProgramUtils'
import { MetricsCard, MetricsCardItem } from 'modules/affiliate/pure/MetricsCard'

export function AffiliatePartnerStats(): ReactElement {
  const { account } = useWalletInfo()
  const { data: info, isLoading: codeLoading } = useAffiliatePartnerInfo(account)
  const { data: stats, isLoading: statsLoading } = useAffiliatePartnerStats(account, info?.code)

  const referralTrafficTooltip = t`This chart tracks eligible volume left to unlock the next reward.`
  const rewardAmountLabel = getRewardAmountLabel(info ?? null)
  const triggerVolume = typeof info?.triggerVolume === 'number' ? info.triggerVolume : null
  const progressToNextReward = getProgressToNextReward(triggerVolume, stats?.left_to_next_reward)
  const progressToNextRewardLabel = formatUsdCompact(progressToNextReward)
  const showTriggerVolume = triggerVolume !== null
  const triggerVolumeLabel = formatUsdCompact(triggerVolume ?? 0)
  const referralTrafficPercent = getReferralTrafficPercent(triggerVolume, progressToNextReward)

  const items: MetricsCardItem[] = [
    {
      label: <Trans>Left to next {rewardAmountLabel}</Trans>,
      value: formatOptionalAmount(stats?.left_to_next_reward, formatUsdCompact),
      labelTooltip: referralTrafficTooltip,
    },
    { label: <Trans>Total earned</Trans>, value: formatOptionalAmount(stats?.total_earned, formatUsdcCompact) },
    { label: <Trans>Received</Trans>, value: formatOptionalAmount(stats?.paid_out, formatUsdcCompact) },
    {
      label: <Trans>Volume referred</Trans>,
      value: formatOptionalAmount(stats?.total_volume, formatUsdCompact),
    },
    { label: <Trans>Active referrals</Trans>, value: formatOptionalInteger(stats?.active_traders) },
  ]
  const donutHint = showTriggerVolume ? (
    <>
      <Trans>of</Trans> {triggerVolumeLabel}
    </>
  ) : undefined

  return (
    <MetricsCard
      showLoader={codeLoading || statsLoading}
      title={<Trans>Your referral traffic</Trans>}
      titleTooltip={referralTrafficTooltip}
      items={items}
      donutValue={referralTrafficPercent}
      donutLabel={progressToNextRewardLabel}
      donutHint={donutHint}
    />
  )
}
