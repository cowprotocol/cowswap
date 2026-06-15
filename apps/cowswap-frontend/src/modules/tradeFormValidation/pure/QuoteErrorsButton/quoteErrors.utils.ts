import { BridgeQuoteErrors } from '@cowprotocol/sdk-bridging'

import { t } from '@lingui/core/macro'

import { QuoteApiErrorCodes } from 'api/cowProtocol/errors/QuoteError'

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

export function getDefaultQuoteError(): string {
  return t`Error loading price. Try again later.`
}

export function getQuoteErrorTexts(): Partial<Record<QuoteApiErrorCodes, string>> {
  return {
    [QuoteApiErrorCodes.AppDataHashMismatch]: t`Order metadata is invalid`,
    [QuoteApiErrorCodes.InvalidAppData]: t`Order metadata is invalid`,
    [QuoteApiErrorCodes.ExcessiveValidTo]: t`Order validity is too long`,
    [QuoteApiErrorCodes.UnsupportedToken]: t`Unsupported token`,
    [QuoteApiErrorCodes.NoLiquidity]: t`Token pair selected has insufficient liquidity`,
    [QuoteApiErrorCodes.InsufficientLiquidity]: t`Insufficient liquidity for this trade`,
    [QuoteApiErrorCodes.SellAmountDoesNotCoverFee]: t`Sell amount is too small`,
    [QuoteApiErrorCodes.SameBuyAndSellToken]: t`Tokens must be different`,
    [QuoteApiErrorCodes.TokenTemporarilySuspended]: t`Token is temporarily suspended from trading`,
    [QuoteApiErrorCodes.TradingOutsideAllowedWindow]: t`Token can only be traded during specific time windows`,
  }
}
