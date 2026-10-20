import { ReactNode } from 'react'

import svgStarShineSrc from '@cowprotocol/assets/cow-swap/star-shine.svg'
import { InfoTooltip } from '@cowprotocol/ui'

import { Trans, useLingui } from '@lingui/react/macro'
import SVG from 'react-inlinesvg'

import * as styledEl from './WaitAndSaveOutcome.styled'
import { formatGainPercentLabel, getGainBarLayout, truncateSymbol } from './WaitAndSaveOutcome.utils'

export interface WaitAndSaveOutcomeProps {
  gainAmount: string
  gainFiat: string
  gainPercent: number
  tradingAloneAmount: string
  tradingAloneNumeric: number
  gainNumeric: number
  tokenSymbol: string
  comparisonTooltip?: ReactNode
  className?: string
}

export function WaitAndSaveOutcome({
  gainAmount,
  gainFiat,
  gainPercent,
  tradingAloneAmount,
  tradingAloneNumeric,
  gainNumeric,
  tokenSymbol,
  comparisonTooltip,
  className,
}: WaitAndSaveOutcomeProps): ReactNode {
  const { t } = useLingui()
  const symbol = truncateSymbol(tokenSymbol)
  const barLayout = getGainBarLayout(tradingAloneNumeric, gainNumeric)
  const percentLabel = formatGainPercentLabel(gainPercent)
  const tooltipContent =
    comparisonTooltip ??
    t`Compared to the estimated amount you would have received by trading alone outside a CoW batch.`

  return (
    <styledEl.Wrapper className={className} data-testid="wait-and-save-outcome">
      <styledEl.DotRamp aria-hidden />

      <styledEl.TopRow>
        <styledEl.TitleGroup>
          <styledEl.SparkleIcon aria-hidden>
            <SVG src={svgStarShineSrc} />
          </styledEl.SparkleIcon>
          <styledEl.Title>
            <Trans>Wait & save</Trans>
          </styledEl.Title>
        </styledEl.TitleGroup>
        <styledEl.GainPill data-testid="wait-and-save-gain-pill">{percentLabel}</styledEl.GainPill>
      </styledEl.TopRow>

      <styledEl.Hero>
        <styledEl.GainAmount>
          +{gainAmount} {symbol}
        </styledEl.GainAmount>
        <styledEl.SubRow>
          <styledEl.SubText>
            <Trans>≈ ${gainFiat} more than trading alone</Trans>
          </styledEl.SubText>
          <InfoTooltip content={tooltipContent} size={16} />
        </styledEl.SubRow>
      </styledEl.Hero>

      <styledEl.Proof>
        <styledEl.BarTrack aria-hidden>
          <styledEl.AloneBar $flex={barLayout.aloneFlex} />
          {barLayout.gainFlex > 0 ? (
            <styledEl.GainBar $flex={barLayout.gainFlex} $minWidthPx={barLayout.gainMinWidthPx} />
          ) : null}
        </styledEl.BarTrack>

        <styledEl.Legend>
          <styledEl.LegendItem>
            <styledEl.LegendSwatch $tone="alone" />
            <styledEl.LegendLabel>
              <Trans>Trading alone · {tradingAloneAmount}</Trans>
            </styledEl.LegendLabel>
          </styledEl.LegendItem>
          <styledEl.LegendItem>
            <styledEl.LegendSwatch $tone="gain" />
            <styledEl.LegendLabel $emphasized>
              <Trans>Wait & save · +{gainAmount}</Trans>
            </styledEl.LegendLabel>
          </styledEl.LegendItem>
        </styledEl.Legend>
      </styledEl.Proof>
    </styledEl.Wrapper>
  )
}
