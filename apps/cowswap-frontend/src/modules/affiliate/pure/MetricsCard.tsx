import type { ReactNode } from 'react'
import { useMemo } from 'react'

import { useTimeAgo } from '@cowprotocol/common-hooks'
import { formatDateWithTimezone } from '@cowprotocol/common-utils'
import { HelpTooltip } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'

import {
  BottomMetaRow,
  CardTitle,
  ColumnTwoCard,
  Donut,
  DonutValue,
  LabelContent,
  MetricItem,
  RewardsMetricsList,
  RewardsMetricsRow,
  TitleWithTooltip,
} from './shared'

import {
  AFFILIATE_REWARDS_UPDATE_INTERVAL_HOURS,
  AFFILIATE_REWARDS_UPDATE_LAG_HOURS,
} from '../config/affiliateProgram.const'
import { getApproxStatsUpdatedAt } from '../lib/affiliateProgramUtils'

export interface MetricsCardItem {
  label: ReactNode
  value: string
}

interface MetricsCardProps {
  showLoader: boolean
  title: ReactNode
  titleTooltip?: string
  items: MetricsCardItem[]
  donutValue: number
  donutLabel: string
  donutSubtitle?: ReactNode
}

export function MetricsCard({
  showLoader,
  title,
  titleTooltip,
  items,
  donutValue,
  donutLabel,
  donutSubtitle,
}: MetricsCardProps): ReactNode {
  const approxUpdatedAt = useMemo(
    () => getApproxStatsUpdatedAt(AFFILIATE_REWARDS_UPDATE_INTERVAL_HOURS, AFFILIATE_REWARDS_UPDATE_LAG_HOURS),
    [],
  )

  const statsUpdatedTimeAgo = useTimeAgo(approxUpdatedAt, 60_000)
  const statsUpdatedLabel = statsUpdatedTimeAgo ? ` ≈ ${statsUpdatedTimeAgo}` : '-'
  const statsUpdatedTitle = formatDateWithTimezone(approxUpdatedAt) ?? undefined

  return (
    <ColumnTwoCard showLoader={showLoader}>
      <CardTitle>
        {titleTooltip ? (
          <TitleWithTooltip>
            <span>{title}</span>
            <HelpTooltip text={titleTooltip} />
          </TitleWithTooltip>
        ) : (
          <span>{title}</span>
        )}
      </CardTitle>
      <RewardsMetricsRow>
        <RewardsMetricsList>
          {items.map(({ label, value }, index) => (
            <MetricItem key={`${index}-${value}`}>
              <LabelContent>{label}</LabelContent>
              <strong>{value}</strong>
            </MetricItem>
          ))}
        </RewardsMetricsList>
        <Donut $value={donutValue}>
          <DonutValue>
            <span>{donutLabel}</span>
            {donutSubtitle ? <small>{donutSubtitle}</small> : null}
          </DonutValue>
        </Donut>
      </RewardsMetricsRow>
      <BottomMetaRow>
        <LabelContent>
          <span>
            <Trans>Last updated</Trans>
            <span title={statsUpdatedTitle}>{statsUpdatedLabel}</span>
          </span>
          <HelpTooltip
            text={
              <Trans>
                Rewards data updates every 6 hours at 00:00, 06:00, 12:00, 18:00 (UTC) and take about one hour to appear
                here.`
              </Trans>
            }
          />
        </LabelContent>
      </BottomMetaRow>
    </ColumnTwoCard>
  )
}
