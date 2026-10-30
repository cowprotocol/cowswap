import { ReactNode } from 'react'

import svgStarShineSrc from '@cowprotocol/assets/cow-swap/star-shine.svg'
import { TokenSymbol, TooltipIcon } from '@cowprotocol/ui'

import { Trans, useLingui } from '@lingui/react/macro'
import SVG from 'react-inlinesvg'

import { useFitHeroFontSize } from './useFitHeroFontSize'
import * as styledEl from './WaitAndSaveOutcome.styled'
import { formatGainPercentLabel, getGainBarLayout } from './WaitAndSaveOutcome.utils'

export interface WaitAndSaveOutcomeProps {
  gainAmount: string
  gainFiat: string
  gainPercent?: number
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
  const heroContent = `+${gainAmount} ${tokenSymbol}`
  const { ref: heroRef, isFitted } = useFitHeroFontSize(heroContent)
  const barLayout = getGainBarLayout(tradingAloneNumeric, gainNumeric)
  const percentLabel = gainPercent === undefined ? undefined : formatGainPercentLabel(gainPercent)
  const tooltipContent =
    comparisonTooltip ??
    t`Compares what you received with the best offer solvers made for your order alone, in the same auction. It's not compared with swapping right away or with your quote.`

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
        {percentLabel ? (
          <styledEl.GainPill data-testid="wait-and-save-gain-pill">{percentLabel}</styledEl.GainPill>
        ) : null}
      </styledEl.TopRow>

      <styledEl.Hero>
        <styledEl.GainAmount ref={heroRef} $isFitted={isFitted}>
          +{gainAmount} <TokenSymbol token={{ symbol: tokenSymbol }} />
        </styledEl.GainAmount>
        <styledEl.SubRow>
          <styledEl.SubText>
            {gainFiat ? <Trans>≈ {gainFiat} more than trading alone</Trans> : <Trans>more than trading alone</Trans>}
          </styledEl.SubText>
          <TooltipIcon type="info" title={t`Wait & save`} content={tooltipContent} />
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
