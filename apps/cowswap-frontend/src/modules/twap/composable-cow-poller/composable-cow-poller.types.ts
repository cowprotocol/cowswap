import type { Hex } from 'viem'

import { type AccountAddress } from '@cowprotocol/cow-sdk'

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
   * First registration must be `COMPOSABLE_COW_POLLER_INITIAL_AUTH_EPOCH` (`0n`).
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
