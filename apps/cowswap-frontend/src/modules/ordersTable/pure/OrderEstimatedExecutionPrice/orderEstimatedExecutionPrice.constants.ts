/**
 * Reason an open order is surfaced as unfillable. Used as a flag to pick the danger tooltip/label;
 * the human-readable, internationalized text is derived from it in `OrderEstimatedExecutionPrice`.
 *
 * `FallbackHandler`: an open TWAP order whose Safe ComposableCoW fallback handler was reset can no
 * longer be created (see issue #5426).
 */
export enum WarningReason {
  Balance = 'balance',
  Allowance = 'allowance',
  FallbackHandler = 'fallback-handler',
}
