import type { Hex } from 'viem'

import { type AccountAddress, SupportedChainId } from '@cowprotocol/cow-sdk'

/**
 * ComposableCowPoller: just-in-time funding for composable conditional orders.
 *
 * Schedules are keyed by an appData-independent `id` (funder, handler, owner, salt),
 * so `pollFunds(id)` can be embedded as a pre-hook in the TWAP's own appData.
 *
 * Shed-authorized registration (`registerFromShed`) removes the separate Register EIP-712.
 * The poller depends on ComposableCoW and on ComposableCoW-enabled cow-shed deployments.
 *
 * Contract ABI: `ComposableCowPollerAbi` from `@cowprotocol/cowswap-abis`.
 *
 * Deployed on Mainnet, Gnosis, and Sepolia (pre-audit).
 *
 * @see https://github.com/cowprotocol/composable-cow/pull/145 — poller / `registerFromShed`
 * @see https://github.com/cowprotocol/composable-cow/commit/b779e50445dd326014f62dcced2dce51dec2f18c — #145 merge
 * @see https://github.com/cowdao-grants/cow-shed/blob/main/networks.json — `COWShedFactoryForComposableCoW` / `COWShedForComposableCoW`
 * @see https://github.com/cowdao-grants/cow-shed/pull/68 — multi-chain ComposableCoW shed deploys
 */
export const COMPOSABLE_COW_POLLER_ADDRESS: Partial<Record<SupportedChainId, AccountAddress>> = {
  // Anxo, 2025-08-25: Sepolia / Mainnet / Gnosis (pre-audit). Address shared in #dev after composable-cow#145.
  [SupportedChainId.MAINNET]: '0xf1C5e22fB6F4B974ad12cA4bc461F9746F77BB7D',
  [SupportedChainId.GNOSIS_CHAIN]: '0xf1C5e22fB6F4B974ad12cA4bc461F9746F77BB7D',
  [SupportedChainId.SEPOLIA]: '0xf1C5e22fB6F4B974ad12cA4bc461F9746F77BB7D',
}

/**
 * Gas budget for the `pollFunds` pre-hook on each TWAP part
 * (SLOADs + getTradeableOrder + transferFrom).
 */
export const POLL_FUNDS_HOOK_GAS_LIMIT = '350000' as const

/**
 * First registration / current funder shed-auth epoch.
 * Must match on-chain `Schedule.authEpoch` (`uint96`).
 */
export const COMPOSABLE_COW_POLLER_INITIAL_AUTH_EPOCH = 0n

/**
 * Parameters for a JIT funding schedule.
 *
 * `handler`, `salt` and `staticInput` are the order's `ConditionalOrderParams` and must
 * match it exactly, since `paramsHash` is derived from them. The schedule key is `funder`,
 * `handler`, `owner`, and `salt`
 *
 * @see https://github.com/cowprotocol/composable-cow/blob/main/src/types/ComposableCowPoller.sol
 * @see https://github.com/cowprotocol/composable-cow/pull/145
 */
export interface ComposableCowPollerSchedule {
  /** Conditional-order handler to poll (e.g. the TWAP type). */
  handler: AccountAddress

  /**
   * Funder shed-authorization epoch (`uint96`).
   * First registration must be {@link COMPOSABLE_COW_POLLER_INITIAL_AUTH_EPOCH}.
   */
  authEpoch: bigint

  /** Source of funds (EOA in the TWAP-for-EOA flow). */
  funder: AccountAddress

  /** Order owner (cow-shed); fixed pull destination. */
  owner: AccountAddress

  /** Conditional order `salt`; lets the poller rebuild `ctx` on-chain. */
  salt: Hex

  /** Order `staticInput`, passed verbatim to `getTradeableOrder`. */
  staticInput: Hex
}
