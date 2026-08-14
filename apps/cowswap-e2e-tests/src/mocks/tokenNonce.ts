import { encodeAbiParameters, toFunctionSelector } from 'viem'

import { mockContractViewCall } from '../support/mockContractViewCall'

import type { BrowserContext } from '@playwright/test'

// No test in this suite asserts on the real on-chain nonce, only that one is present — a fixed
// value removes the real dependency entirely, same rationale as `installEthBlockNumber`.
const NONCE_RESULT = encodeAbiParameters([{ type: 'uint256' }], [1n])

/**
 * `eip2612Utils.getTokenNonce` reads a token's EIP-2612 permit nonce via a plain `eth_call` to
 * `nonces(address)`, routed through the app's own read-only `publicClient` — a real page network
 * request, but to whichever real RPC/Infura host that client picked, not a URL this suite
 * controls. Matched by selector alone, host-agnostically, same technique as
 * `mockApproveSimulation.ts` uses for `approve()`: the nonce is faked to the same constant
 * regardless of which token or owner it's queried for.
 */
export function installTokenNonce(context: BrowserContext): void {
  mockContractViewCall(context, undefined, toFunctionSelector('nonces(address)'), () => NONCE_RESULT)
}
