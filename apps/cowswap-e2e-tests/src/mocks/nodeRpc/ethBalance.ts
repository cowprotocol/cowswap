import { encodeAbiParameters, parseUnits, type Hex } from 'viem'

import {
  classifyEthCall,
  isFullyMocked,
  isFullyOpaqueCall,
  resolveEthBalanceBatch,
  type ClassifiedEthCall,
} from '../../support/mockEthFlowTransaction'
import { mockRpcNodeRequest, type JsonRpcEntry } from '../../support/mockRpcNodeRequest'

import type { BrowserContext } from '@playwright/test'

const UINT256 = [{ type: 'uint256' }] as const

export interface EthBalanceMock {
  /** Overrides the native ETH balance reported for `owner` going forward. */
  set(balance: bigint): void
}

/**
 * Answers the wallet owner's native ETH balance — read via Multicall3's `getEthBalance`, batched
 * through `aggregate3` (see `classifyEthCall` in `mockEthFlowTransaction.ts`; this app never issues
 * a bare `eth_getBalance`) — with a fixed default (1 ETH) so it never needs the real network.
 *
 * Every test's wallet gets this polled in the background regardless of what token it's actually
 * trading. The only existing mock for it, `installNativeBalanceRoute`, is wired up solely by
 * `mockEthFlowTransaction`/`mockWrapTransaction`/`mockUnwrapTransaction` — every other test (the
 * vast majority of the suite, anything not exercising a native-ETH send) had no mock for this call
 * at all. Traced via a CI failure's own network trace (`_wasFulfilled: false`, real `dns`/`connect`/
 * `ssl` timings): an ERC20-only cross-chain confirm (`[CS-287]`) leaked this exact `eth_call` to the
 * real `REACT_APP_NETWORK_URL_1` host every few seconds for the test's entire duration, including
 * during the signing window `expectOrderToBePosted` was timing — a real, rate-limited dependency
 * (same class as `ethGetCode.ts`'s own history) rather than anything CI-load-slow about the mocked
 * flow itself.
 *
 * Registered *ahead of* `mockEthFlowTransaction`/`mockWrapTransaction`/`mockUnwrapTransaction` in
 * the `mocks` fixture (Playwright route order is LIFO — last registered gets first look), so a test
 * that also calls one of those still gets that mock's own dynamic, tx-tracking balance instead of
 * this static default.
 */
export function installEthBalance(context: BrowserContext, owner: string): EthBalanceMock {
  let balance = parseUnits('1', 18)

  const classify = (entry: JsonRpcEntry): ClassifiedEthCall | undefined => {
    if (entry.method !== 'eth_call') return undefined
    const call = entry.params[0] as { to?: string; data?: Hex } | undefined
    return call?.data ? classifyEthCall(call.data, owner, call.to ?? '') : undefined
  }

  mockRpcNodeRequest(
    context,
    'eth_call',
    (entry, upstreamResult) => {
      const call = classify(entry)
      if (!call || call.kind === 'opaque') return undefined
      if (call.kind === 'ownBalance') return encodeAbiParameters(UINT256, [balance])
      if (isFullyMocked(context, call)) return resolveEthBalanceBatch(context, call, balance)
      if (typeof upstreamResult !== 'string') return undefined
      return resolveEthBalanceBatch(context, call, balance, upstreamResult as Hex)
    },
    (entry) => {
      const call = classify(entry)
      return call !== undefined && !isFullyOpaqueCall(call)
    },
  )

  return {
    set(next) {
      balance = next
    },
  }
}
