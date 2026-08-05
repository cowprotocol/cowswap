import type { Address, Hex } from 'viem'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

/**
 * ComposableCowPoller: just-in-time funding for composable conditional orders.
 *
 * Schedules are keyed by an appData-independent `id` (`scheduleId(funder, handler, owner, salt)`),
 * so `pollFunds(id)` can be embedded as a pre-hook in the TWAP's own appData.
 *
 * Currently deployed on Gnosis only (PoC / deploy PR).
 *
 * @see https://github.com/cowprotocol/composable-cow/pull/116
 * @see https://github.com/cowprotocol/composable-cow/pull/126
 * @see https://github.com/anxolin/cow-sdk-scripts/pull/14
 */
export const COMPOSABLE_COW_POLLER_ADDRESS: Partial<Record<SupportedChainId, Address>> = {
  [SupportedChainId.GNOSIS_CHAIN]: '0xA360eE11eD0d2025604518CF4B8F6e6CB76C7Df7',
}

/**
 * When true, register the poller schedule via signature inside the TwapSetup / sell=buy post-hook
 * instead of sending an EOA `register()` transaction.
 *
 * TODO: Keep false until `registerWithSignature` (or equivalent) is deployed on the poller.
 *
 * @see https://github.com/cowprotocol/composable-cow/pull/128
 */
export const EOA_TWAP_JIT_REGISTER_VIA_SIGNATURE: boolean = false

/**
 * Gas budget for the `pollFunds` pre-hook on each TWAP part
 * (SLOADs + getTradeableOrder + transferFrom).
 */
export const POLL_FUNDS_HOOK_GAS_LIMIT = '350000' as const

/**
 * Minimal ABI for `ComposableCowPoller`.
 */
export const COMPOSABLE_COW_POLLER_ABI = [
  {
    type: 'function',
    name: 'composableCow',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    type: 'function',
    name: 'scheduleId',
    stateMutability: 'pure',
    inputs: [
      { name: 'funder', type: 'address' },
      { name: 'handler', type: 'address' },
      { name: 'owner', type: 'address' },
      { name: 'salt', type: 'bytes32' },
    ],
    outputs: [{ name: '', type: 'bytes32' }],
  },
  {
    type: 'function',
    name: 'register',
    stateMutability: 'nonpayable',
    inputs: [
      {
        name: 'schedule',
        type: 'tuple',
        components: [
          { name: 'handler', type: 'address' },
          { name: 'funder', type: 'address' },
          { name: 'owner', type: 'address' },
          { name: 'salt', type: 'bytes32' },
          { name: 'staticInput', type: 'bytes' },
        ],
      },
    ],
    outputs: [{ name: 'id', type: 'bytes32' }],
  },
  {
    type: 'function',
    name: 'revoke',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'id', type: 'bytes32' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'pollFunds',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'id', type: 'bytes32' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'schedules',
    stateMutability: 'view',
    inputs: [{ name: 'id', type: 'bytes32' }],
    outputs: [
      { name: 'handler', type: 'address' },
      { name: 'funder', type: 'address' },
      { name: 'owner', type: 'address' },
      { name: 'salt', type: 'bytes32' },
      { name: 'staticInput', type: 'bytes' },
    ],
  },
  {
    type: 'function',
    name: 'lastFunded',
    stateMutability: 'view',
    inputs: [{ name: 'id', type: 'bytes32' }],
    outputs: [{ name: '', type: 'bytes32' }],
  },
] as const

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
