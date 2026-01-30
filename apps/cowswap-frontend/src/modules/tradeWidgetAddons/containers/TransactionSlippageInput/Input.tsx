import { ReactNode, RefObject } from 'react'

import { RowBetween } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'

import { SlippageWarningParams } from './hooks/types'
import { SlippageError } from './hooks/useSlippageInput'
import * as styledEl from './styled'

interface InputProps {
  isSlippageModified: boolean
  slippageError: false | SlippageError
  focusOnInput: () => void
  isQuoteLoading: boolean
  isInputFocused: boolean
  slippageWarningParams: SlippageWarningParams | null
  inputRef: RefObject<HTMLInputElement | null>
  slippageViewValue: string
  parseSlippageInput: (value: string) => void
  onSlippageInputBlur: () => void
  placeholderSlippage: string
}
export function Input({
  isSlippageModified,
  slippageError,
  focusOnInput,
  isQuoteLoading,
  isInputFocused,
  slippageWarningParams,
  inputRef,
  slippageViewValue,
  parseSlippageInput,
  onSlippageInputBlur,
  placeholderSlippage,
}: InputProps): ReactNode {
  return (
    <styledEl.OptionCustom active={isSlippageModified} warning={!!slippageError} tabIndex={-1} onClick={focusOnInput}>
      {!isSlippageModified && isQuoteLoading && !isInputFocused ? (
        <styledEl.SlippageLoader size="16px" />
      ) : (
        <RowBetween>
          {slippageWarningParams &&
          !isQuoteLoading &&
          (slippageWarningParams.tooLow || slippageWarningParams?.tooHigh) ? (
            <styledEl.SlippageEmojiContainer>
              <span role="img" aria-label={t`warning`}>
                ⚠️
              </span>
            </styledEl.SlippageEmojiContainer>
          ) : null}
          <styledEl.Input
            ref={inputRef}
            autoFocus={isInputFocused}
            placeholder={placeholderSlippage}
            value={slippageViewValue}
            onChange={(e) => parseSlippageInput(e.target.value)}
            onBlur={onSlippageInputBlur}
          />
          %
        </RowBetween>
      )}
    </styledEl.OptionCustom>
  )
}
