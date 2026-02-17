import { ReactElement, useMemo } from 'react'

import { useTimeAgo } from '@cowprotocol/common-hooks'
import { formatDateWithTimezone } from '@cowprotocol/common-utils'
import { HelpTooltip } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { useLingui } from '@lingui/react/macro'

import {
  AFFILIATE_REWARDS_UPDATE_INTERVAL_HOURS,
  AFFILIATE_REWARDS_UPDATE_LAG_HOURS,
} from 'modules/affiliate/config/affiliateProgram.const'
import { TraderStatsResponse, TraderReferralCodeVerificationStatus } from 'modules/affiliate/lib/affiliateProgramTypes'
import { formatUsdcCompact, formatUsdCompact } from 'modules/affiliate/lib/affiliateProgramUtils'
import {
  BottomMetaRow,
  CardTitle,
  Donut,
  DonutValue,
  LabelContent,
  MetricItem,
  RewardsCol2Card,
  RewardsMetricsList,
  RewardsMetricsRow,
} from 'modules/affiliate/pure/shared'

interface AffiliateTraderMetricsCardProps {
  loading: boolean
  traderStats?: TraderStatsResponse
  verification: TraderReferralCodeVerificationStatus
}

interface RewardsMetricsViewModel {
  rewardAmountLabel: string
  leftToNextRewardLabel: string
  totalEarnedLabel: string
  claimedLabel: string
  rewardsProgressPercent: number
  rewardsProgressLabel: string
  hasTriggerVolume: boolean
  triggerVolumeLabel: string
}

function getProgramTriggerVolume(verification: TraderReferralCodeVerificationStatus): number | null {
  const programParams = verification.kind === 'valid' ? verification.programParams : undefined
  return typeof programParams?.triggerVolumeUsd === 'number' ? programParams.triggerVolumeUsd : null
}

function getProgressToNextReward(triggerVolume: number | null, leftToNextRewards?: number): number {
  if (triggerVolume === null || leftToNextRewards === undefined) return 0
  return Math.max(triggerVolume - leftToNextRewards, 0)
}

function getRewardsProgressPercent(triggerVolume: number | null, progressToNextReward: number): number {
  if (!triggerVolume) return 0
  return Math.min(100, Math.round((progressToNextReward / triggerVolume) * 100))
}

function getRewardsMetricsViewModel(
  traderStats: TraderStatsResponse | undefined,
  verification: TraderReferralCodeVerificationStatus,
): RewardsMetricsViewModel {
  const statsReady = Boolean(traderStats)
  const programParams = verification.kind === 'valid' ? verification.programParams : undefined
  const rewardAmountLabel = programParams ? formatUsdCompact(programParams.traderRewardAmount) : 'reward'
  const triggerVolume = getProgramTriggerVolume(verification)
  const leftToNextRewards = statsReady ? traderStats?.left_to_next_rewards : undefined
  const progressToNextReward = getProgressToNextReward(triggerVolume, leftToNextRewards)
  const rewardsProgressPercent = getRewardsProgressPercent(triggerVolume, progressToNextReward)

  return {
    rewardAmountLabel,
    leftToNextRewardLabel: statsReady ? formatUsdCompact(leftToNextRewards) : '-',
    totalEarnedLabel: statsReady ? formatUsdcCompact(traderStats?.total_earned) : '-',
    claimedLabel: statsReady ? formatUsdcCompact(traderStats?.paid_out) : '-',
    rewardsProgressPercent,
    rewardsProgressLabel: triggerVolume !== null ? formatUsdCompact(progressToNextReward) : formatUsdCompact(0),
    hasTriggerVolume: triggerVolume !== null,
    triggerVolumeLabel: triggerVolume !== null ? formatUsdCompact(triggerVolume) : formatUsdCompact(0),
  }
}

export function AffiliateTraderMetricsCard({
  loading,
  traderStats,
  verification,
}: AffiliateTraderMetricsCardProps): ReactElement {
  const { i18n } = useLingui()
  const {
    rewardAmountLabel,
    leftToNextRewardLabel,
    totalEarnedLabel,
    claimedLabel,
    rewardsProgressPercent,
    rewardsProgressLabel,
    hasTriggerVolume,
    triggerVolumeLabel,
  } = getRewardsMetricsViewModel(traderStats, verification)
  const approxStatsUpdatedAt = useMemo((): Date => {
    const intervalMs = AFFILIATE_REWARDS_UPDATE_INTERVAL_HOURS * 60 * 60 * 1000
    const lagMs = AFFILIATE_REWARDS_UPDATE_LAG_HOURS * 60 * 60 * 1000
    // eslint-disable-next-line react-hooks/purity
    const approximateUpdatedAtMs = Math.floor((Date.now() - lagMs) / intervalMs) * intervalMs + lagMs
    return new Date(approximateUpdatedAtMs)
  }, [])
  const statsUpdatedLabel = useTimeAgo(approxStatsUpdatedAt, 60_000)
  const statsUpdatedDisplay = statsUpdatedLabel ? ` ≈ ${statsUpdatedLabel}` : '-'
  const statsUpdatedText = i18n._(t`Last updated`)
  const statsUpdatedTooltip = i18n._(
    t`Rewards data updates every 6 hours at 00:00, 06:00, 12:00, 18:00 (UTC) and take about one hour to appear here.`,
  )
  const statsUpdatedTitle = formatDateWithTimezone(approxStatsUpdatedAt) ?? undefined

  return (
    <RewardsCol2Card showLoader={loading}>
      <CardTitle>
        <Trans>Next {rewardAmountLabel} reward</Trans>
      </CardTitle>
      <RewardsMetricsRow>
        <RewardsMetricsList>
          <MetricItem>
            <span>
              <Trans>Left to next {rewardAmountLabel}</Trans>
            </span>
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
            <strong>{claimedLabel}</strong>
          </MetricItem>
        </RewardsMetricsList>
        <Donut $value={rewardsProgressPercent}>
          <DonutValue>
            <span>{rewardsProgressLabel}</span>
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
            {statsUpdatedText}
            <span title={statsUpdatedTitle}>{statsUpdatedDisplay}</span>
          </span>
          <HelpTooltip text={statsUpdatedTooltip} />
        </LabelContent>
      </BottomMetaRow>
    </RewardsCol2Card>
  )
}
