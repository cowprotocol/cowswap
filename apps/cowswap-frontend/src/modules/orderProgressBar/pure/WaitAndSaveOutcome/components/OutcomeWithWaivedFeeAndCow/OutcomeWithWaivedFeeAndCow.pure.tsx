import { ReactNode } from 'react'

import svgStarShineSrc from '@cowprotocol/assets/cow-swap/star-shine.svg'
import { TooltipIcon } from '@cowprotocol/ui'

import { Trans, useLingui } from '@lingui/react/macro'
import SVG from 'react-inlinesvg'

import { useAutoFitText } from 'common/hooks/useAutoFitText'

import * as styledEl from './OutcomeWithWaivedFeeAndCow.styled'

import { WAIT_AND_SAVE_HERO_FONT_MAX_PX, WAIT_AND_SAVE_HERO_FONT_MIN_PX } from '../../waitAndSaveOutcome.constants'
import * as sharedStyledEl from '../shared/WaitAndSaveOutcomeShared.styled'

export interface OutcomeWithWaivedFeeAndCowProps {
  priceImprovement: string
  priceImprovementTitle?: string
  totalSaved: string
  totalSavedTitle?: string
  volumeFeeSaved: string
  volumeFeeSavedTitle?: string
  comparisonTooltip?: ReactNode
  className?: string
}

export function OutcomeWithWaivedFeeAndCow({
  priceImprovement,
  priceImprovementTitle,
  totalSaved,
  totalSavedTitle,
  volumeFeeSaved,
  volumeFeeSavedTitle,
  comparisonTooltip,
  className,
}: OutcomeWithWaivedFeeAndCowProps): ReactNode {
  const { t } = useLingui()
  const { ref: heroRef, isFitted } = useAutoFitText<HTMLParagraphElement>({
    min: WAIT_AND_SAVE_HERO_FONT_MIN_PX,
    max: WAIT_AND_SAVE_HERO_FONT_MAX_PX,
    mode: 'single',
    deps: [totalSaved],
  })
  const tooltipContent =
    comparisonTooltip ??
    t`Compares what you received with the best offer solvers made for your order alone, in the same auction. It's not compared with swapping right away or with your quote.`
  const totalSavedAmount = (
    <sharedStyledEl.GainAmount ref={heroRef} $isFitted={isFitted}>
      {totalSaved}
    </sharedStyledEl.GainAmount>
  )
  const priceImprovementAmount = (
    <>
      +<styledEl.SavingsAmount>{priceImprovement}</styledEl.SavingsAmount>
    </>
  )
  const volumeFeeSavedAmount = (
    <>
      +<styledEl.SavingsAmount>{volumeFeeSaved}</styledEl.SavingsAmount>
    </>
  )

  return (
    <sharedStyledEl.Wrapper className={className} data-testid="wait-and-save-outcome">
      <sharedStyledEl.TitleGroup>
        <sharedStyledEl.SparkleIcon aria-hidden>
          <SVG src={svgStarShineSrc} />
        </sharedStyledEl.SparkleIcon>
        <sharedStyledEl.Title>
          <Trans>Wait & save · You saved</Trans>
        </sharedStyledEl.Title>
      </sharedStyledEl.TitleGroup>

      <sharedStyledEl.GainAmountSlot>
        {totalSavedTitle ? (
          <styledEl.AmountTooltip content={totalSavedTitle} disableHoverablePopup placement="top">
            {totalSavedAmount}
          </styledEl.AmountTooltip>
        ) : (
          totalSavedAmount
        )}
      </sharedStyledEl.GainAmountSlot>

      <styledEl.SavingsBox>
        <styledEl.SavingsRow>
          <styledEl.SavingsLabel>
            <Trans>Better price than trading alone</Trans>
            <TooltipIcon type="info" title={t`Wait & save`} content={tooltipContent} />
          </styledEl.SavingsLabel>
          <styledEl.SavingsValue>
            {priceImprovementTitle ? (
              <styledEl.AmountTooltip content={priceImprovementTitle} disableHoverablePopup placement="top">
                {priceImprovementAmount}
              </styledEl.AmountTooltip>
            ) : (
              priceImprovementAmount
            )}
          </styledEl.SavingsValue>
        </styledEl.SavingsRow>

        <styledEl.SavingsRow>
          <styledEl.SavingsLabel>
            <Trans>No volume fee</Trans>
          </styledEl.SavingsLabel>
          <styledEl.SavingsValue>
            {volumeFeeSavedTitle ? (
              <styledEl.AmountTooltip content={volumeFeeSavedTitle} disableHoverablePopup placement="top">
                {volumeFeeSavedAmount}
              </styledEl.AmountTooltip>
            ) : (
              volumeFeeSavedAmount
            )}
          </styledEl.SavingsValue>
        </styledEl.SavingsRow>
      </styledEl.SavingsBox>
    </sharedStyledEl.Wrapper>
  )
}
