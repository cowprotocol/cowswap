/**
 * `data-testid` values shared between `cowswap-frontend` (where they're rendered) and
 * `cowswap-e2e-tests` (where they're queried) — import from here on both sides instead of
 * duplicating the literal string, so a rename only happens once.
 *
 * Elements that are only ever instantiated once in the DOM keep a plain `id` instead (see the
 * e2e suite's page objects) — this file is only for hooks that need `data-testid` because either
 * several instances of the same component can render at once, or the id would otherwise collide.
 */
export const TEST_IDS = {
  // CurrencyInputPanel
  fiatAmount: 'fiat-amount',
  tokenAmountInput: 'token-amount-input',
  currencyBalanceText: 'currency-balance-text',

  // CurrencyAmountPreview (read-only amount shown on review/confirm screens)
  currencyAmountPreviewValue: 'currency-amount-preview-value',

  // PriceImpactIndicator
  priceImpact: 'price-impact',

  // ReceiveAmount ("Receive (incl. fees)" row under the swap form)
  receiveAmountLabel: 'receive-amount-label',
  receiveAmountValue: 'receive-amount-value',

  // ReceiveAmountInfoTooltip rows
  beforeCosts: 'before-costs',
  protocolFee: 'protocol-fee',
  partnerFee: 'partner-fee',
  networkCosts: 'network-costs',
  bridgeCosts: 'bridge-costs',
  freeFee: 'free-fee',
  receiveAmountTotal: 'receive-amount-total',

  // AddressInputPanel
  recipientAddressInput: 'recipient-address-input',

  // ReviewOrderModalAmountRow (Confirm modal's "Maximum sent" / "Minimum receive" / ... rows)
  confirmOrderAmount: 'confirm-order-amount',

  // TradeDetailsAccordion (bridge/route details expand toggle)
  tradeDetailsAccordionToggle: 'trade-details-accordion-toggle',

  // CollapsibleBridgeRoute
  collapsibleBridgeRoute: 'collapsible-bridge-route',

  // OrdersTabs
  ordersTableTab: 'orders-table-tab',

  // TradeFormBlankButton
  tradeFormBlankButton: 'trade-form-blank-button',

  // SnackbarPopup
  snackbarPopup: 'snackbar-popup',

  // erc20Approve Toggle ("Partial approval" / infinite mode selector)
  approveModeSelector: 'approve-mode-selector',

  // FinishedStep ("You sold" / "Received" rows)
  orderSoldAmount: 'order-sold-amount',
  orderReceivedAmount: 'order-received-amount',

  // SwapPage.openOrders / TwapPage (not yet rendered by the frontend — reserved for upcoming tests)
  openOrdersList: 'open-orders-list',
  twapPartsInput: 'twap-parts-input',
  twapDurationInput: 'twap-duration-input',

  // BridgeRoutePanel's swap-leg rows (QuoteSwapContent / TradeFeesAndCosts) — distinct from
  // `confirmOrderAmount`/`networkCosts` above, which are the same-looking rows in a different
  // surface (the plain Confirm modal / the receive-amount tooltip) that can be in the DOM at the
  // same time as the expanded route panel.
  routeSwapFee: 'route-swap-fee',
  routeSwapNetworkCosts: 'route-swap-network-costs',
  routeSwapExpectedToReceive: 'route-swap-expected-to-receive',
  routeSwapMinToReceive: 'route-swap-min-to-receive',
  routeSwapRecipient: 'route-swap-recipient',
  routeSwapQuoteId: 'route-swap-quote-id',

  // BridgeRoutePanel's bridge-leg rows (QuoteBridgeContent)
  routeBridgeEstTime: 'route-bridge-est-time',
  routeBridgeCosts: 'route-bridge-costs',
  routeBridgeExpectedToReceive: 'route-bridge-expected-to-receive',
  routeBridgeMinToDeposit: 'route-bridge-min-to-deposit',
  routeBridgeRecipient: 'route-bridge-recipient',
  routeBridgeMinToReceive: 'route-bridge-min-to-receive',
} as const

export type TestId = (typeof TEST_IDS)[keyof typeof TEST_IDS]
