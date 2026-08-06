import type { Address, Hex } from 'viem'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

/**
 * ComposableCowPoller: just-in-time funding for composable conditional orders.
 *
 * Schedules are keyed by an appData-independent `id` (funder, handler, owner, salt),
 * so `pollFunds(id)` can be embedded as a pre-hook in the TWAP's own appData.
 *
 * Currently deployed on Gnosis only.
 *
 * @see https://github.com/cowprotocol/composable-cow/pull/116
 * @see https://github.com/cowprotocol/composable-cow/pull/126
 * @see https://github.com/cowprotocol/composable-cow/pull/135
 * @see https://github.com/cowprotocol/cow-sdk/pull/957
 * @see https://github.com/anxolin/cow-sdk-scripts/pull/14
 */
export const COMPOSABLE_COW_POLLER_ADDRESS: Partial<Record<SupportedChainId, Address>> = {
  [SupportedChainId.GNOSIS_CHAIN]: '0xA360eE11eD0d2025604518CF4B8F6e6CB76C7Df7',
}

/**
 * Gas budget for the `pollFunds` pre-hook on each TWAP part
 * (SLOADs + getTradeableOrder + transferFrom).
 */
export const POLL_FUNDS_HOOK_GAS_LIMIT = '350000' as const

export interface ComposableCowPollerSchedule {
  /** Conditional-order handler to poll (e.g. the TWAP type). */
  handler: Address
  /** Source of funds (EOA in the TWAP-for-EOA flow); the only registrant. */
  funder: Address
  /** Order owner (cow-shed); fixed pull destination. */
  owner: Address
  /** Conditional order `salt`; lets the poller rebuild `ctx` on-chain. */
  salt: Hex
  /** Order `staticInput`, passed verbatim to `getTradeableOrder`. */
  staticInput: Hex
}
