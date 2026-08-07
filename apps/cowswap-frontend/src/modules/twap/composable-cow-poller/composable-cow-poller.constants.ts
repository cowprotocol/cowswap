import type { Hex } from 'viem'

import { type AccountAddress, SupportedChainId } from '@cowprotocol/cow-sdk'

/**
 * ComposableCowPoller: just-in-time funding for composable conditional orders.
 *
 * Schedules are keyed by an appData-independent `id` (funder, handler, owner, salt),
 * so `pollFunds(id)` can be embedded as a pre-hook in the TWAP's own appData.
 *
 * Contract ABI: `ComposableCowPollerAbi` from `@cowprotocol/cowswap-abis`.
 *
 * Currently deployed on Gnosis only.
 *
 * @see https://github.com/cowprotocol/composable-cow/pull/116
 * @see https://github.com/cowprotocol/composable-cow/pull/126
 * @see https://github.com/cowprotocol/composable-cow/pull/135
 * @see https://github.com/cowprotocol/cow-sdk/pull/957
 * @see https://github.com/anxolin/cow-sdk-scripts/pull/14
 */
export const COMPOSABLE_COW_POLLER_ADDRESS: Partial<Record<SupportedChainId, AccountAddress>> = {
  [SupportedChainId.GNOSIS_CHAIN]: '0x5eda08425781c2c39a28faaf963c79487dc91bb1',
}

/**
 * Gas budget for the `pollFunds` pre-hook on each TWAP part
 * (SLOADs + getTradeableOrder + transferFrom).
 */
export const POLL_FUNDS_HOOK_GAS_LIMIT = '350000' as const

export interface ComposableCowPollerSchedule {
  /** Conditional-order handler to poll (e.g. the TWAP type). */
  handler: AccountAddress
  /** Source of funds (EOA in the TWAP-for-EOA flow); the only registrant. */
  funder: AccountAddress
  /** Order owner (cow-shed); fixed pull destination. */
  owner: AccountAddress
  /** Conditional order `salt`; lets the poller rebuild `ctx` on-chain. */
  salt: Hex
  /** Order `staticInput`, passed verbatim to `getTradeableOrder`. */
  staticInput: Hex
}
