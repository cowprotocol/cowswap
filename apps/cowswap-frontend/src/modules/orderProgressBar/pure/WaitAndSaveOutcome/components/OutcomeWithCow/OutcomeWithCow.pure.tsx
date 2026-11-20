import { ReactNode } from 'react'

import svgStarShineSrc from '@cowprotocol/assets/cow-swap/star-shine.svg'
import { TokenSymbol, TooltipIcon } from '@cowprotocol/ui'

import { Trans, useLingui } from '@lingui/react/macro'
import SVG from 'react-inlinesvg'

import { useAutoFitText } from 'common/hooks/useAutoFitText'

import * as styledEl from './OutcomeWithCow.styled'

import { WAIT_AND_SAVE_HERO_FONT_MAX_PX, WAIT_AND_SAVE_HERO_FONT_MIN_PX } from '../../waitAndSaveOutcome.constants'
import * as sharedStyledEl from '../shared/WaitAndSaveOutcomeShared.styled'

export interface OutcomeWithCowProps {
  gainAmount: string
  tokenSymbol: string
  comparisonTooltip?: ReactNode
  className?: string
}

export function OutcomeWithCow({
  gainAmount,
  tokenSymbol,
  comparisonTooltip,
  className,
}: OutcomeWithCowProps): ReactNode {
  const { t } = useLingui()
  const heroContent = `+${gainAmount} ${tokenSymbol}`
  const { ref: heroRef, isFitted } = useAutoFitText<HTMLParagraphElement>({
    min: WAIT_AND_SAVE_HERO_FONT_MIN_PX,
    max: WAIT_AND_SAVE_HERO_FONT_MAX_PX,
    mode: 'single',
    deps: [heroContent],
  })
  const tooltipContent =
    comparisonTooltip ??
    t`Compares what you received with the best offer solvers made for your order alone, in the same auction. It's not compared with swapping right away or with your quote.`

  return (
    <sharedStyledEl.Wrapper className={className} data-testid="wait-and-save-outcome">
      <sharedStyledEl.TitleGroup>
        <sharedStyledEl.SparkleIcon aria-hidden>
          <SVG src={svgStarShineSrc} />
        </sharedStyledEl.SparkleIcon>
        <sharedStyledEl.Title>
          <Trans>Wait & save</Trans>
        </sharedStyledEl.Title>
      </sharedStyledEl.TitleGroup>

      <sharedStyledEl.GainAmountSlot>
        <sharedStyledEl.GainAmount ref={heroRef} $isFitted={isFitted}>
          +{gainAmount} <TokenSymbol token={{ symbol: tokenSymbol }} />
        </sharedStyledEl.GainAmount>
      </sharedStyledEl.GainAmountSlot>

      <styledEl.SubRow>
        <styledEl.SubText>
          <Trans>Better price than trading alone</Trans>
        </styledEl.SubText>
        <TooltipIcon type="info" title={t`Wait & save`} content={tooltipContent} />
      </styledEl.SubRow>
    </sharedStyledEl.Wrapper>
  )
}
