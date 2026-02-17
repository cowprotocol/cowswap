import { ReactElement, useMemo } from 'react'

import { useTimeAgo } from '@cowprotocol/common-hooks'
import { formatDateWithTimezone } from '@cowprotocol/common-utils'
import { HelpTooltip } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { useLingui } from '@lingui/react/macro'
import { Trans } from '@lingui/react/macro'

import {
  AFFILIATE_REWARDS_UPDATE_INTERVAL_HOURS,
  AFFILIATE_REWARDS_UPDATE_LAG_HOURS,
} from 'modules/affiliate/config/affiliateProgram.const'
import { PartnerInfoResponse, PartnerStatsResponse } from 'modules/affiliate/lib/affiliateProgramTypes'
import { formatUsdCompact, formatUsdcCompact } from 'modules/affiliate/lib/affiliateProgramUtils'
import {
  BottomMetaRow,
  CardTitle,
  Donut,
  DonutValue,
  LabelContent,
  MetricItem,
  ColumnTwoCard,
  RewardsMetricsList,
  RewardsMetricsRow,
  TitleWithTooltip,
} from 'modules/affiliate/pure/shared'

const EMPTY_VALUE_LABEL = '-'

interface AffiliatePartnerTrafficCardProps {
  loading: boolean
  partnerStats: PartnerStatsResponse | null
  programParams: PartnerInfoResponse | null
}

export function AffiliatePartnerTrafficCard({
  loading,
  partnerStats,
  programParams,
}: AffiliatePartnerTrafficCardProps): ReactElement {
  const { i18n } = useLingui()
  const statsReady = Boolean(partnerStats)
  const triggerVolume = typeof programParams?.triggerVolume === 'number' ? programParams.triggerVolume : null
  const leftToNextReward = partnerStats?.left_to_next_reward
  const progressToNextReward = triggerVolume !== null && leftToNextReward !== undefined ? Math.max(triggerVolume - leftToNextReward, 0) : 0
  const referralTrafficPercent = triggerVolume ? Math.min(100, Math.round((progressToNextReward / triggerVolume) * 100)) : 0
  const progressToNextRewardLabel = triggerVolume !== null ? formatUsdCompact(progressToNextReward) : formatUsdCompact(0)
  const hasTriggerVolume = triggerVolume !== null
  const triggerVolumeLabel = hasTriggerVolume ? formatUsdCompact(triggerVolume) : formatUsdCompact(0)
  const affiliateRewardAmount =
    typeof programParams?.rewardAmount === 'number' && typeof programParams?.revenueSplitAffiliatePct === 'number'
      ? programParams.rewardAmount * (programParams.revenueSplitAffiliatePct / 100)
      : null

  const approxStatsUpdatedAt = useMemo((): Date => {
    const intervalMs = AFFILIATE_REWARDS_UPDATE_INTERVAL_HOURS * 60 * 60 * 1000
    const lagMs = AFFILIATE_REWARDS_UPDATE_LAG_HOURS * 60 * 60 * 1000
    return new Date(Math.floor((Date.now() - lagMs) / intervalMs) * intervalMs + lagMs)
  }, [])
  const statsUpdatedLabel = useTimeAgo(approxStatsUpdatedAt, 60_000)
  const statsUpdatedDisplay = statsUpdatedLabel ? ` ≈ ${statsUpdatedLabel}` : '-'
  const statsUpdatedTitle = formatDateWithTimezone(approxStatsUpdatedAt) ?? undefined
  const referralTrafficTooltip = i18n._(t`This chart tracks eligible volume left to unlock the next reward.`)
  const statsUpdatedTooltip = i18n._(
    t`Rewards data updates every 6 hours at 00:00, 06:00, 12:00, 18:00 (UTC) and take about one hour to appear here.`,
  )
  const rewardAmountLabel = affiliateRewardAmount !== null ? formatUsdCompact(affiliateRewardAmount) : 'reward'
  const leftToNextRewardLabel = statsReady ? formatUsdCompact(partnerStats.left_to_next_reward) : EMPTY_VALUE_LABEL
  const totalEarnedLabel = statsReady ? formatUsdcCompact(partnerStats.total_earned) : EMPTY_VALUE_LABEL
  const paidOutLabel = statsReady ? formatUsdcCompact(partnerStats.paid_out) : EMPTY_VALUE_LABEL
  const totalVolumeLabel = statsReady ? formatUsdCompact(partnerStats.total_volume) : EMPTY_VALUE_LABEL
  const activeReferralsLabel = statsReady && typeof partnerStats.active_traders === 'number' ? String(partnerStats.active_traders) : EMPTY_VALUE_LABEL

  return (
    <ColumnTwoCard showLoader={loading}>
      <CardTitle>
        <TitleWithTooltip>
          <span>
            <Trans>Your referral traffic</Trans>
          </span>
          <HelpTooltip text={referralTrafficTooltip} />
        </TitleWithTooltip>
      </CardTitle>
      <RewardsMetricsRow>
        <RewardsMetricsList>
          <MetricItem>
            <LabelContent>
              <Trans>Left to next {rewardAmountLabel}</Trans>
              <HelpTooltip text={referralTrafficTooltip} />
            </LabelContent>
            <strong>{leftToNextRewardLabel}</strong>
          </MetricItem>
          <MetricItem>
            <span>
              <Trans>Total earned</Trans>
            </span>
            <strong>{totalEarnedLabel}</strong>
          </MetricItem>
          <MetricItem>
            <span>
              <Trans>Received</Trans>
            </span>
            <strong>{paidOutLabel}</strong>
          </MetricItem>
          <MetricItem>
            <span>
              <Trans>Volume referred</Trans>
            </span>
            <strong>{totalVolumeLabel}</strong>
          </MetricItem>
          <MetricItem>
            <span>
              <Trans>Active referrals</Trans>
            </span>
            <strong>{activeReferralsLabel}</strong>
          </MetricItem>
        </RewardsMetricsList>

        <Donut $value={referralTrafficPercent}>
          <DonutValue>
            <span>{progressToNextRewardLabel}</span>
            {hasTriggerVolume && (
              <small>
                <Trans>of</Trans> {triggerVolumeLabel}
              </small>
            )}
          </DonutValue>
        </Donut>
      </RewardsMetricsRow>
      <BottomMetaRow>
        <LabelContent>
          <span>
            <Trans>Last updated</Trans>
            <span title={statsUpdatedTitle}>{statsUpdatedDisplay}</span>
          </span>
          <HelpTooltip text={statsUpdatedTooltip} />
        </LabelContent>
      </BottomMetaRow>
    </ColumnTwoCard>
  )
}
