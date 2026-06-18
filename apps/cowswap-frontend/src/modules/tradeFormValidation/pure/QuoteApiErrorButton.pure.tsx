import { ReactNode } from 'react'

import { HelpTooltip } from '@cowprotocol/ui'

import { QuoteApiError, QuoteApiErrorCodes, UNHANDLED_ERROR_CODE } from 'api/cowProtocol/errors/QuoteError'

import { getDefaultQuoteError, getQuoteErrorTexts } from './QuoteErrorsButton/quoteErrors.utils'
import { TradeFormBlankButton } from './TradeFormBlankButton'
import { UnsupportedTokenButton } from './UnsupportedTokenButton.pure'

import { TradeFormButtonContext } from '../types'

export function QuoteApiErrorButton(props: TradeFormButtonContext): ReactNode {
  const { quote } = props

  if (!quote || !(quote.error instanceof QuoteApiError)) return null

  const DEFAULT_ERROR_TEXT = getDefaultQuoteError()

  const quoteErrorTexts = getQuoteErrorTexts()

  const errorType = quote.error.type
  const errorDescription = quote.error.description

  if (errorType === QuoteApiErrorCodes.UnsupportedToken) {
    return <UnsupportedTokenButton {...props} />
  }

  if (errorType === UNHANDLED_ERROR_CODE) {
    return (
      <TradeFormBlankButton disabled>
        <>{DEFAULT_ERROR_TEXT}</>
      </TradeFormBlankButton>
    )
  }

  const errorText = quoteErrorTexts[errorType] ?? DEFAULT_ERROR_TEXT

  const errorTooltipText = errorText === DEFAULT_ERROR_TEXT ? errorDescription : null

  return (
    <TradeFormBlankButton disabled>
      <>
        {errorText}
        {errorTooltipText && <HelpTooltip text={errorTooltipText} />}
      </>
    </TradeFormBlankButton>
  )
}
