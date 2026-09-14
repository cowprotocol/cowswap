import { BridgeQuoteErrors } from '@cowprotocol/sdk-bridging'

import { t } from '@lingui/core/macro'

import { QuoteApiErrorCodes } from 'api/cowProtocol/errors/QuoteError'

/**
 * Only the errors we have our own copy for. The rest are omitted on purpose so the caller can fall
 * back to the provider's own explanation, which is more specific than anything generic we'd write.
 */
export function getBridgeQuoteErrorTexts(): Partial<Record<BridgeQuoteErrors, string>> {
  return {
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
