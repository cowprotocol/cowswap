import { ReactNode } from 'react'

import { BridgeQuoteErrors } from '@cowprotocol/sdk-bridging'
import { HelpTooltip } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'

import { QuoteApiError, QuoteApiErrorCodes } from 'api/cowProtocol/errors/QuoteError'

import { getBridgeQuoteErrorTexts, getQuoteErrorTexts } from './QuoteErrorsButton/quoteErrors.utils'
import { TradeFormBlankButton } from './TradeFormBlankButton'
import { UnsupportedTokenButton } from './UnsupportedTokenButton.pure'

import { TradeFormButtonContext } from '../types'

export function QuoteApiErrorButton(props: TradeFormButtonContext): ReactNode {
  const { quote } = props

  if (!quote || !(quote.error instanceof QuoteApiError)) return null

  const DEFAULT_QUOTE_ERROR = t`Error loading price. Try again later.`

  const quoteErrorTexts = getQuoteErrorTexts()

  {
    /*TODO: sell=buy feature. Remove all SameBuyAndSellToken usages once feature is ready */
  }
  const quoteErrorTextsForBridges: Partial<Record<QuoteApiErrorCodes, string>> = {
    [QuoteApiErrorCodes.SameBuyAndSellToken]: t`Not yet supported`,
  }

  const errorTooltipContentForBridges: Partial<Record<QuoteApiErrorCodes, string>> = {
    [QuoteApiErrorCodes.SameBuyAndSellToken]: t`Bridging without swapping is not yet supported. Let us know if you want this feature!`,
  }

  const bridgeQuoteErrorTexts = getBridgeQuoteErrorTexts()

  const errorType = quote.error.type

  if (errorType === QuoteApiErrorCodes.UnsupportedToken) {
    return <UnsupportedTokenButton {...props} />
  }

  const isBridge = quote.isBridgeQuote
  const errorText = (() => {
    const quoteErrorText = quoteErrorTexts[errorType]
    const bridgeQuoteErrorText = quoteErrorTextsForBridges[errorType]

    if (isBridge && bridgeQuoteErrorText) {
      // Do not display "Not yet supported" when sell and intermediate tokens are the same
      // Because user doesn't see intermediate token
      if (errorType === QuoteApiErrorCodes.SameBuyAndSellToken) {
        const areSwapAssetsDifferent =
          props.derivedState.inputCurrency?.symbol?.toLowerCase() !==
          props.derivedState.outputCurrency?.symbol?.toLowerCase()

        if (areSwapAssetsDifferent) {
          return bridgeQuoteErrorTexts[BridgeQuoteErrors.NO_ROUTES]
        }
      }

      return bridgeQuoteErrorText
    }

    return quoteErrorText || DEFAULT_QUOTE_ERROR
  })()

  const errorTooltipText = isBridge && errorTooltipContentForBridges[errorType]

  return (
    <TradeFormBlankButton disabled={true}>
      <>
        {errorText}
        {errorTooltipText && <HelpTooltip text={errorTooltipText} />}
      </>
    </TradeFormBlankButton>
  )
}
