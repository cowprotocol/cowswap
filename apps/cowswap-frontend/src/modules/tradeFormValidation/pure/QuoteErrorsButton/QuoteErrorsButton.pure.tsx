import { ReactNode } from 'react'

import { BridgeProviderQuoteError, BridgeQuoteErrors } from '@cowprotocol/sdk-bridging'
import { InfoTooltip } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import { QuoteApiError } from 'api/cowProtocol/errors/QuoteError'

import { getBridgeQuoteErrorTexts } from './quoteErrors.utils'

import { TradeFormButtonContext } from '../../types'
import { QuoteApiErrorButton } from '../QuoteApiErrorButton.pure'
import { TradeFormBlankButton } from '../TradeFormBlankButton'

export function QuoteErrorsButton(props: TradeFormButtonContext): ReactNode {
  const DEFAULT_QUOTE_ERROR = t`Error loading price. Try again later.`

  const bridgeQuoteErrorTexts = getBridgeQuoteErrorTexts()

  const { quote } = props

  if (quote.error instanceof QuoteApiError) {
    return <QuoteApiErrorButton {...props} />
  }

  if (quote.error instanceof BridgeProviderQuoteError) {
    const errorMessage = quote.error.message as BridgeQuoteErrors
    const errorText = bridgeQuoteErrorTexts[errorMessage] || DEFAULT_QUOTE_ERROR

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
