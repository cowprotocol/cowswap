import { ReactNode } from 'react'

import svgStarShineSrc from '@cowprotocol/assets/cow-swap/star-shine.svg'

import { Trans } from '@lingui/react/macro'
import SVG from 'react-inlinesvg'

import * as styledEl from './OutcomeWithWaivedFee.styled'

import * as sharedStyledEl from '../shared/WaitAndSaveOutcomeShared.styled'

export interface OutcomeWithWaivedFeeProps {
  volumeFeeSavedFiat: string
  className?: string
}

export function OutcomeWithWaivedFee({ volumeFeeSavedFiat, className }: OutcomeWithWaivedFeeProps): ReactNode {
  return (
    <styledEl.CompactBox className={className} data-testid="wait-and-save-outcome">
      <sharedStyledEl.SparkleIcon aria-hidden>
        <SVG src={svgStarShineSrc} />
      </sharedStyledEl.SparkleIcon>
      <styledEl.CompactText>
        <Trans>
          Wait & save: <styledEl.CompactAmount>{volumeFeeSavedFiat}</styledEl.CompactAmount> saved on the volume fee
        </Trans>
      </styledEl.CompactText>
    </styledEl.CompactBox>
  )
}
