import type { ReactNode } from 'react'
import { useMemo } from 'react'

import { useTimeAgo } from '@cowprotocol/common-hooks'
import { formatDateWithTimezone } from '@cowprotocol/common-utils'
import { HelpTooltip } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import ms from 'ms.macro'

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

import { getApproxStatsUpdatedAt, toValidDate } from '../lib/affiliateProgramUtils'

export interface MetricsCardItem {
  id: string
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
  lastUpdatedAt?: string
}

const TIME_AGO_UPDATE_INTERVAL_MS = ms`1m`

export function MetricsCard({
  showLoader,
  title,
  titleTooltip,
  items,
  donutValue,
  donutLabel,
  donutSubtitle,
  lastUpdatedAt,
}: MetricsCardProps): ReactNode {
  const approxUpdatedAt = useMemo(() => getApproxStatsUpdatedAt(), [])
  const statsUpdatedAt = toValidDate(lastUpdatedAt) ?? approxUpdatedAt
  const statsUpdatedTimeAgo = useTimeAgo(statsUpdatedAt, TIME_AGO_UPDATE_INTERVAL_MS)

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
          {items.map(({ id, label, value }) => (
            <MetricItem key={id}>
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
            <span title={formatDateWithTimezone(statsUpdatedAt)}> {statsUpdatedTimeAgo}</span>
          </span>
          <HelpTooltip text={<Trans>Updates every 24 hours</Trans>} dimmed />
        </LabelContent>
      </BottomMetaRow>
    </ColumnTwoCard>
  )
}
