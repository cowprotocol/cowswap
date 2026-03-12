import { BridgeQuoteErrors } from '@cowprotocol/sdk-bridging'

import { t } from '@lingui/core/macro'

import { QuoteApiErrorCodes } from 'api/cowProtocol/errors/QuoteError'

function getDefaultQuoteError(): string {
  return t`Error loading price. Try again later.`
}

export function getQuoteErrorTexts(): Record<QuoteApiErrorCodes, string> {
  return {
    [QuoteApiErrorCodes.UNHANDLED_ERROR]: getDefaultQuoteError(),
    [QuoteApiErrorCodes.TransferEthToContract]: t`Buying native currency with smart contract wallets is not currently supported`,
    [QuoteApiErrorCodes.UnsupportedToken]: t`Unsupported token`,
    [QuoteApiErrorCodes.InsufficientLiquidity]: t`Insufficient liquidity for this trade.`,
    [QuoteApiErrorCodes.FeeExceedsFrom]: t`Sell amount is too small`,
    [QuoteApiErrorCodes.ZeroPrice]: t`Invalid price. Try increasing input/output amount.`,
    [QuoteApiErrorCodes.SameBuyAndSellToken]: t`Tokens must be different`,
  }
}

export function getBridgeQuoteErrorTexts(): Record<BridgeQuoteErrors, string> {
  const DEFAULT_QUOTE_ERROR = getDefaultQuoteError()

  return {
    [BridgeQuoteErrors.API_ERROR]: DEFAULT_QUOTE_ERROR,
    [BridgeQuoteErrors.INVALID_BRIDGE]: DEFAULT_QUOTE_ERROR,
    [BridgeQuoteErrors.TX_BUILD_ERROR]: DEFAULT_QUOTE_ERROR,
    [BridgeQuoteErrors.QUOTE_ERROR]: DEFAULT_QUOTE_ERROR,
    [BridgeQuoteErrors.INVALID_API_JSON_RESPONSE]: DEFAULT_QUOTE_ERROR,
    [BridgeQuoteErrors.NO_INTERMEDIATE_TOKENS]: t`No routes found`,
    [BridgeQuoteErrors.NO_ROUTES]: t`No routes found`,
    [BridgeQuoteErrors.ONLY_SELL_ORDER_SUPPORTED]: t`Only "sell" orders are supported`,
    [BridgeQuoteErrors.QUOTE_DOES_NOT_MATCH_DEPOSIT_ADDRESS]: t`Bridging deposit address is not verified! Please contact CoW Swap support!`,
    [BridgeQuoteErrors.SELL_AMOUNT_TOO_SMALL]: t`Sell amount too small to bridge`,
  }
}
