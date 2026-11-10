import { ReactNode } from 'react'

import { COW_BATCH_TIME_SECONDS } from '@cowprotocol/common-const'
import { ButtonSecondary, InlineBanner, StatusColorVariant } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import styled from 'styled-components/macro'

import { deadlinePartsDisplay } from '../../../utils/deadlinePartsDisplay'
import { TwapCowBatchCadenceSuggestion } from '../../../utils/twapCowBatchCadence'

const ApplyButton = styled(ButtonSecondary).attrs({ type: 'button' })`
  width: fit-content;
  margin-top: 4px;
`

export interface CowBatchCadenceSuggestionProps {
  suggestion: TwapCowBatchCadenceSuggestion
  /** Seconds. */
  currentPartTime: number
  onApply: (parts: number) => void
}

export function CowBatchCadenceSuggestion({
  suggestion,
  currentPartTime,
  onApply,
}: CowBatchCadenceSuggestionProps): ReactNode {
  const { parts } = suggestion
  const currentPartTimeDisplay = deadlinePartsDisplay(currentPartTime, true)
  const suggestedPartTimeDisplay = deadlinePartsDisplay(suggestion.partTime, true)
  const batchTimeDisplay = deadlinePartsDisplay(COW_BATCH_TIME_SECONDS, true)

  return (
    <InlineBanner bannerType={StatusColorVariant.Info}>
      <strong>
        <Trans>Match CoW batches</Trans>
      </strong>
      <p>
        <Trans>
          A part duration of <b>{currentPartTimeDisplay}</b> falls between CoW batches, which run every{' '}
          {batchTimeDisplay}. With <b>{parts} parts</b> ({suggestedPartTimeDisplay} each), every part joins a batch with
          other traders and has more chances to be matched.
        </Trans>
      </p>
      <ApplyButton onClick={() => onApply(parts)} $fontSize="13px" $minHeight="32px" padding="6px 12px">
        <Trans>Use {parts} parts</Trans>
      </ApplyButton>
    </InlineBanner>
  )
}
