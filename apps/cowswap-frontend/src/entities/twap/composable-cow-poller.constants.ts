/**
 * Gas budget for the `pollFunds` pre-hook on each EOA TWAP part
 * (SLOADs + getTradeableOrder + transferFrom).
 *
 * Shared by placement (`injectPollFundsPreHookIntoAppData`) and quoting
 * (`getEoaTwapQuotePreHooks`) so both stay on the same declared limit.
 */
export const POLL_FUNDS_HOOK_GAS_LIMIT = '350000' as const
