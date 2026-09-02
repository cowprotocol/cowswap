import {
  TradeFormValidation,
  useGetTradeFormValidation,
  useIsTradeFormValidationPassed,
} from 'modules/tradeFormValidation'

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
  const passed = useIsTradeFormValidationPassed()

  // ⚠️ **A primary validation is not the same as a disabled button.**
  //
  // Some validations describe a button that works and does an extra step first —
  // approve-and-swap, wrap-and-swap. The app names them in ACTIVE_VALIDATION_CASES,
  // and useIsTradeFormValidationPassed is its own predicate for "can this trade go
  // ahead". Deferring to it is the only way this can't drift from what the button
  // actually does.
  //
  // Reading any validation as a block produced "the form says it needs the ETH
  // wrapped to WETH first" beside a fully enabled Swap button. Selling native ETH on
  // a market order is ordinary and needs no wrap — the form never said otherwise;
  // the claim was manufactured here and then attributed to it.
  if (validation === null || passed) return null

  return BLOCKER_BY_VALIDATION[validation] ?? 'other'
}

const BLOCKER_BY_VALIDATION: Partial<Record<TradeFormValidation, AssistantFormBlocker>> = {
  [TradeFormValidation.BalanceInsufficient]: 'insufficient_balance',

  // The trade IS a wrap or unwrap — a different flow, not a broken one.
  [TradeFormValidation.WrapUnwrapFlow]: 'sell_native_needs_wrap',

  // SellNativeToken, ApproveRequired and ApproveAndSwapInBundle are deliberately
  // absent: the app lists all three in ACTIVE_VALIDATION_CASES, meaning the trade
  // proceeds and the button just does an extra step first. They're unreachable past
  // the guard above, and listing them invited exactly the mistake it now prevents.
  // Approvals reach the assistant through `approval`, which distinguishes a free
  // signature from a gas-costing transaction — a distinction this signal can't make.

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
