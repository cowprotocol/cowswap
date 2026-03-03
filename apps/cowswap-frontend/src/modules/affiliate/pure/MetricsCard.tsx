import type { ReactNode } from 'react'
import { useMemo } from 'react'

import { useTimeAgo } from '@cowprotocol/common-hooks'
import { formatDateWithTimezone } from '@cowprotocol/common-utils'
import { HelpTooltip } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'

import { Donut } from './Donut.pure'
import {
  BottomMetaRow,
  CardTitle,
  ColumnTwoCard,
  LabelContent,
  MetricItem,
  MetricValue,
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
  const statsUpdatedLabel = statsUpdatedTimeAgo ? ` ~ ${statsUpdatedTimeAgo}` : '-'
  const statsUpdatedTitle = formatDateWithTimezone(approxUpdatedAt) ?? undefined

  return (
    <ColumnTwoCard showLoader={showLoader}>
      <CardTitle>
        {titleTooltip ? (
          <TitleWithTooltip>
            <span>{title}</span>
            <HelpTooltip text={titleTooltip} dimmed noMargin />
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
              <MetricValue>{value}</MetricValue>
            </MetricItem>
          ))}
        </RewardsMetricsList>
        <Donut value={donutValue}>
          <span>{donutLabel}</span>
          {donutSubtitle ? <small>{donutSubtitle}</small> : null}
        </Donut>
      </RewardsMetricsRow>
      <BottomMetaRow>
        <LabelContent>
          <span>
            <Trans>Last updated</Trans>
            <span title={statsUpdatedTitle}>{statsUpdatedLabel}</span>
          </span>
          <HelpTooltip text={<Trans>Updates every 6 hours</Trans>} dimmed />
        </LabelContent>
      </BottomMetaRow>
    </ColumnTwoCard>
  )
}
