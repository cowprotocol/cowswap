import { ReactNode } from 'react'

import svgStarShineSrc from '@cowprotocol/assets/cow-swap/star-shine.svg'
import { TokenSymbol } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import SVG from 'react-inlinesvg'

import { useFitHeroFontSize } from './useFitHeroFontSize'
import * as styledEl from './WaitAndSaveOutcome.styled'
import { WaitAndSaveOutcomeProps } from './WaitAndSaveOutcome.types'
import { formatGainPercentLabel, getGainBarLayout } from './WaitAndSaveOutcome.utils'

export type { WaitAndSaveOutcomeProps } from './WaitAndSaveOutcome.types'

export function WaitAndSaveOutcome({
  gainAmount,
  gainFiat,
  gainPercent,
  tradingAloneAmount,
  tradingAloneNumeric,
  gainNumeric,
  tokenSymbol,
  className,
}: WaitAndSaveOutcomeProps): ReactNode {
  const heroContent = `+${gainAmount} ${tokenSymbol}`
  const { ref: heroRef, isFitted } = useFitHeroFontSize(heroContent)
  const barLayout = getGainBarLayout(tradingAloneNumeric, gainNumeric)
  const percentLabel = formatGainPercentLabel(gainPercent)

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
        <styledEl.GainAmount ref={heroRef} $isFitted={isFitted}>
          +{gainAmount} <TokenSymbol token={{ symbol: tokenSymbol }} />
        </styledEl.GainAmount>
        {gainFiat ? (
          <styledEl.SubText>
            <Trans>≈ ${gainFiat} more than quoted</Trans>
          </styledEl.SubText>
        ) : null}
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
              <Trans>Quoted · {tradingAloneAmount}</Trans>
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
