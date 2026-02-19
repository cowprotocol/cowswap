import type { ReactNode } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import { useAffiliatePartnerInfo } from '../hooks/useAffiliatePartnerInfo'
import { useAffiliatePartnerStats } from '../hooks/useAffiliatePartnerStats'
import {
  formatCompactNumber,
  formatUsdCompact,
  formatUsdcCompact,
  getProgressToNextReward,
  getReferralTrafficPercent,
  getPartnerRewardAmountLabel,
} from '../lib/affiliateProgramUtils'
import { MetricsCard } from '../pure/MetricsCard'

export function AffiliatePartnerStats(): ReactNode {
  const { account } = useWalletInfo()
  const { data: info, isLoading: codeLoading } = useAffiliatePartnerInfo(account)
  const { data: stats, isLoading: statsLoading } = useAffiliatePartnerStats(account, info?.code)

  const rewardAmountLabel = getPartnerRewardAmountLabel(info)
  const progressToNextReward = getProgressToNextReward(info?.triggerVolume, stats?.left_to_next_reward)

  return (
    <MetricsCard
      showLoader={codeLoading || statsLoading}
      title={<Trans>Your referral traffic</Trans>}
      titleTooltip={t`This chart tracks eligible volume left to unlock the next reward.`}
      items={[
        {
          label: <Trans>Left to next {rewardAmountLabel}</Trans>,
          value: formatUsdCompact(stats?.left_to_next_reward),
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
          value: formatCompactNumber(stats?.active_traders),
        },
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
