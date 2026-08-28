import { TradeFormValidation, useGetTradeFormValidation } from 'modules/tradeFormValidation'

import { AssistantFormBlocker } from '../types'

/**
 * Why the form's button is disabled, when it is.
 *
 * Without this the assistant could see that a trade looked bad and could see nothing
 * about what the form had actually decided, so it filled the gap: told someone the
 * button was disabled by price impact when the form was plainly saying "Insufficient
 * WETH balance". A wrong reason is worse than no reason — it sends someone off to
 * fix something that isn't broken, and the real cause is sitting in front of them.
 *
 * Mapped to a small set of plain meanings rather than passed through raw. The enum
 * has thirty-odd members drawn along the app's internal seams — three separate
 * loading states, two approval shapes — and the model needs the distinctions that
 * change what it should say, not the ones that change what the app should render.
 */
export function useFormBlocker(): AssistantFormBlocker | null {
  const validation = useGetTradeFormValidation()
  return validation === null ? null : (BLOCKER_BY_VALIDATION[validation] ?? 'other')
}

const BLOCKER_BY_VALIDATION: Partial<Record<TradeFormValidation, AssistantFormBlocker>> = {
  [TradeFormValidation.BalanceInsufficient]: 'insufficient_balance',

  // Wrapping is its own flow with its own explanation; naming it lets the assistant
  // pick that up rather than reporting a dead button.
  [TradeFormValidation.SellNativeToken]: 'sell_native_needs_wrap',
  [TradeFormValidation.WrapUnwrapFlow]: 'sell_native_needs_wrap',

  [TradeFormValidation.ApproveRequired]: 'approval_needed',
  [TradeFormValidation.ApproveAndSwapInBundle]: 'approval_needed',

  // Every flavour of "not finished yet" is one thing to a person: wait a moment.
  [TradeFormValidation.BalancesLoading]: 'loading',
  [TradeFormValidation.BalancesNotLoaded]: 'loading',
  [TradeFormValidation.QuoteLoading]: 'loading',
  [TradeFormValidation.ImpactLoading]: 'loading',
  [TradeFormValidation.CaptchaPending]: 'loading',
  [TradeFormValidation.WalletCapabilitiesLoading]: 'loading',
  [TradeFormValidation.RestoringWallet]: 'loading',
  [TradeFormValidation.ProxyAccountLoading]: 'loading',
  [TradeFormValidation.ImportingIntermediateToken]: 'loading',

  [TradeFormValidation.QuoteErrors]: 'quote_error',
  [TradeFormValidation.QuoteExpired]: 'quote_error',
  [TradeFormValidation.CustomTokenError]: 'quote_error',

  [TradeFormValidation.CurrencyNotSupported]: 'token_unsupported',
  [TradeFormValidation.WidgetConstrainedTokenPair]: 'token_unsupported',

  [TradeFormValidation.CurrencyNotSet]: 'incomplete',
  [TradeFormValidation.InputAmountNotSet]: 'incomplete',
  [TradeFormValidation.RecipientNotSet]: 'incomplete',
  [TradeFormValidation.RecipientInvalid]: 'incomplete',
  [TradeFormValidation.RecipientNotConfirmed]: 'incomplete',

  [TradeFormValidation.WalletNotConnected]: 'wallet_not_connected',
  [TradeFormValidation.WalletNotSupported]: 'wallet_not_connected',
  [TradeFormValidation.SafeReadonlyUser]: 'wallet_not_connected',

  [TradeFormValidation.NetworkNotSupported]: 'network_unsupported',
  [TradeFormValidation.NetworkDeprecated]: 'network_unsupported',
  [TradeFormValidation.BrowserOffline]: 'offline',

  [TradeFormValidation.RestrictedForCountry]: 'restricted',
  [TradeFormValidation.XstockMinimumTradeSize]: 'restricted',

  // Widget-controlled, so it does NOT fire in the app — which is exactly why the
  // assistant must never assume impact is the reason a button is disabled.
  [TradeFormValidation.DisableTradeWithHighPriceImpact]: 'price_impact',
  [TradeFormValidation.DisableTradeWithUnknownPriceImpact]: 'price_impact',
}
