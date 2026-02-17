import type { ReactElement, ReactNode } from 'react'
import { useMemo } from 'react'

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
import { getApproxStatsUpdatedAt } from 'modules/affiliate/lib/affiliateProgramUtils'
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
} from 'modules/affiliate/pure/shared'

export interface MetricsCardItem {
  label: ReactNode
  value: string
  labelTooltip?: string
}

interface MetricsCardProps {
  showLoader: boolean
  title: ReactNode
  titleTooltip?: string
  items: MetricsCardItem[]
  donutValue: number
  donutLabel: string
  donutHint?: ReactNode
}

export function MetricsCard({
  showLoader,
  title,
  titleTooltip,
  items,
  donutValue,
  donutLabel,
  donutHint,
}: MetricsCardProps): ReactElement {
  const { i18n } = useLingui()
  const approxUpdatedAt = useMemo(
    () => getApproxStatsUpdatedAt(AFFILIATE_REWARDS_UPDATE_INTERVAL_HOURS, AFFILIATE_REWARDS_UPDATE_LAG_HOURS),
    [],
  )

  const statsUpdatedTimeAgo = useTimeAgo(approxUpdatedAt, 60_000)
  const statsUpdatedLabel = statsUpdatedTimeAgo ? ` ≈ ${statsUpdatedTimeAgo}` : '-'
  const statsUpdatedTitle = formatDateWithTimezone(approxUpdatedAt) ?? undefined
  const statsUpdatedTooltip = i18n._(
    t`Rewards data updates every 6 hours at 00:00, 06:00, 12:00, 18:00 (UTC) and take about one hour to appear here.`,
  )

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
          {items.map(({ label, value, labelTooltip }, index) => (
            <MetricItem key={`${index}-${value}`}>
              <LabelContent>
                {label}
                {labelTooltip ? <HelpTooltip text={labelTooltip} /> : null}
              </LabelContent>
              <strong>{value}</strong>
            </MetricItem>
          ))}
        </RewardsMetricsList>
        <Donut $value={donutValue}>
          <DonutValue>
            <span>{donutLabel}</span>
            {donutHint ? <small>{donutHint}</small> : null}
          </DonutValue>
        </Donut>
      </RewardsMetricsRow>
      <BottomMetaRow>
        <LabelContent>
          <span>
            <Trans>Last updated</Trans>
            <span title={statsUpdatedTitle}>{statsUpdatedLabel}</span>
          </span>
          <HelpTooltip text={statsUpdatedTooltip} />
        </LabelContent>
      </BottomMetaRow>
    </ColumnTwoCard>
  )
}
