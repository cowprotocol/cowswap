import { ReactNode } from 'react'

import { BridgeProviderQuoteError, BridgeQuoteErrors } from '@cowprotocol/sdk-bridging'
import { InfoTooltip } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import { QuoteApiError } from 'api/cowProtocol/errors/QuoteError'

import { getBridgeProviderErrorMessage } from './getBridgeProviderErrorMessage'
import { getBridgeQuoteErrorTexts, getDefaultQuoteError } from './quoteErrors.utils'

import { TradeFormButtonContext } from '../../types'
import { QuoteApiErrorButton } from '../QuoteApiErrorButton.pure'
import { TradeFormBlankButton } from '../TradeFormBlankButton'

export function QuoteErrorsButton(props: TradeFormButtonContext): ReactNode {
  const DEFAULT_QUOTE_ERROR = getDefaultQuoteError()

  const bridgeQuoteErrorTexts = getBridgeQuoteErrorTexts()

  const { quote } = props

  if (quote.error instanceof QuoteApiError) {
    return <QuoteApiErrorButton {...props} />
  }

  if (quote.error instanceof BridgeProviderQuoteError) {
    const errorMessage = quote.error.message as BridgeQuoteErrors
    // Errors we have no copy for (a rejected API call, a failed tx build) carry the provider's own
    // explanation - "minimum swap amount is $1,000" and the like. Show it: the generic text below
    // tells the user to retry, which won't help when the request is the problem.
    //
    // The provider writes that explanation at runtime, so it is always English and cannot be
    // extracted for translation. Framing it with a translated label at least tells a non-English
    // user where the English sentence came from.
    const providerErrorMessage = getBridgeProviderErrorMessage(quote.error.context)
    const errorText =
      bridgeQuoteErrorTexts[errorMessage] ||
      (providerErrorMessage && t`Bridge error: ${providerErrorMessage}`) ||
      DEFAULT_QUOTE_ERROR

    return (
      <TradeFormBlankButton disabled={true}>
        <>
          {errorText}
          {errorMessage === BridgeQuoteErrors.NO_INTERMEDIATE_TOKENS && (
            <InfoTooltip content={t`No intermediate tokens found for the route`} />
          )}
        </>
      </TradeFormBlankButton>
    )
  }

  return (
    <TradeFormBlankButton disabled={true}>
      <Trans>Unknown quote error</Trans>
    </TradeFormBlankButton>
  )
}
