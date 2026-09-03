import type { Address, Hex } from 'viem'

import type { BrowserContext } from '@playwright/test'

/** Answers one nested call (`target`, `callData`) recognized wherever it appears inside a *different*
 * mock's own Multicall3 batch, or `undefined` if this resolver doesn't recognize it at all. */
export type NestedCallResolver = (target: Address, callData: Hex) => unknown

const registry = new WeakMap<BrowserContext, NestedCallResolver[]>()

/**
 * Lets one mock's recognized call be found by a *different* mock's own batch-merge logic when the
 * two happen to land in the same Multicall3 `aggregate3` call — purely by viem's own incidental
 * request batching, not because the two mocks are related at all (e.g. `installSocketVerifier`'s
 * `validateRotueId` check landing alongside `installNativeBalanceRoute`'s `getEthBalance`).
 *
 * `mockContractViewCall` registers one of these automatically for every one of its own callers
 * (`installAllowances`, `installTokenNonce`, `installSocketVerifier`, ...) — see its own doc
 * comment — so nothing needs to call this directly just to be *found*. A mock with its own,
 * separate merge logic (`mockEthFlowTransaction.ts`'s `resolveEthBalanceBatch`) instead *consults*
 * `resolveNestedCall` for a slot it doesn't itself recognize, before giving up and relaying
 * whatever a real upstream fetch said for it. Neither side ever imports the other's selectors or
 * addresses — they only depend on this neutral registry.
 */
export function registerNestedCallResolver(context: BrowserContext, resolver: NestedCallResolver): void {
  const resolvers = registry.get(context)
  if (resolvers) {
    resolvers.push(resolver)
  } else {
    registry.set(context, [resolver])
  }
}

/** Returns the first non-`undefined` answer from every resolver registered for `context`, tried in
 * registration order, or `undefined` if none of them recognize this call. */
export function resolveNestedCall(context: BrowserContext, target: Address, callData: Hex): unknown {
  for (const resolver of registry.get(context) ?? []) {
    const result = resolver(target, callData)
    if (typeof result !== 'undefined') return result
  }
  return undefined
}
