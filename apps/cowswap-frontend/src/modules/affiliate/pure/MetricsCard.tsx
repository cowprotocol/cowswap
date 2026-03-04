import type { ReactNode } from 'react'
import { useMemo } from 'react'

import { useTimeAgo } from '@cowprotocol/common-hooks'
import { formatDateWithTimezone } from '@cowprotocol/common-utils'
import { HelpTooltip } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'

import { CardTitle, ColumnTwoCard } from './AffiliateCards.shared'
import {
  BottomMetaRow,
  LabelContent,
  MetricItem,
  MetricsList,
  MetricsRow,
  TitleWithTooltip,
} from './AffiliateMetrics.shared'
import { Donut, DonutValue } from './Donut'

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
  const approxUpdatedAt = useMemo(() => getApproxStatsUpdatedAt(), [])
  const statsUpdatedTimeAgo = useTimeAgo(approxUpdatedAt, 60_000)

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
      <MetricsRow>
        <MetricsList>
          {items.map(({ label, value }, index) => (
            <MetricItem key={`${index}-${value}`}>
              <LabelContent>{label}</LabelContent>
              <strong>{value}</strong>
            </MetricItem>
          ))}
        </MetricsList>
        <Donut $value={donutValue}>
          <DonutValue>
            <span>{donutLabel}</span>
            {donutSubtitle ? <small>{donutSubtitle}</small> : null}
          </DonutValue>
        </Donut>
      </MetricsRow>
      <BottomMetaRow>
        <LabelContent>
          <span>
            <Trans>Last updated</Trans>
            <span title={formatDateWithTimezone(approxUpdatedAt)}> ~ {statsUpdatedTimeAgo}</span>
          </span>
          <HelpTooltip text={<Trans>Updates every 6 hours</Trans>} />
        </LabelContent>
      </BottomMetaRow>
    </ColumnTwoCard>
  )
}
