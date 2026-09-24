/**
 * Gas budget forwarded to the `pollFunds` pre-hook on each EOA TWAP part.
 * Placement (`injectPollFundsPreHookIntoAppData`) declares this limit. Quoting uses {@link POLL_FUNDS_QUOTE_GAS}.
 */
export const POLL_FUNDS_HOOK_GAS_LIMIT = '350000' as const

/**
 * Expected `pollFunds` gas solvers burn, used only as the quote no-op's `gasLimit`.
 * `applyUnpricedHookGasToOrderParams` sums that limit into the fee.
 *
 * Got this value from mainnet USDC settlements of the same hook:
 * 67739 in 0xaa2a44feae5f1ed38b1d91ff4414c49568db783a7d753f911cdd6c72f2fdff1f,
 * 116739 in 0x6689cff19efb2b6bab6249c9f757252a1ff8c0a2b060256a56b96af538356a3b.
 * 140000 is about 20% above the higher bill, 116739.
 */
export const POLL_FUNDS_QUOTE_GAS = '140000' as const
