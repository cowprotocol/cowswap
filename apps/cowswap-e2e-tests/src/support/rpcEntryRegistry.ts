import type { JsonRpcEntry } from './mockRpcNodeRequest'
import type { BrowserContext } from '@playwright/test'

/** Answers one whole JSON-RPC entry recognized wherever it appears inside a *different* mock's
 * batch, or `undefined` if this resolver doesn't recognize it at all. */
export type RpcEntryResolver = (entry: JsonRpcEntry) => unknown

const registry = new WeakMap<BrowserContext, RpcEntryResolver[]>()

/**
 * The top-level counterpart of `nestedRpcCallRegistry` (which does the same for calls nested inside
 * a Multicall3 batch): lets one mock answer an entry that viem's own incidental JSON-RPC batching
 * dropped into a *different* mock's request — e.g. `eth_getTransactionCount` arriving in the same
 * POST as `mockApproveTransaction`'s `eth_getTransactionReceipt` poll.
 *
 * Playwright dispatches `context.route` handlers LIFO and the winner fulfills the whole batch, so
 * without this the earlier-registered mock never runs and its entries get relayed to a real,
 * rate-limited upstream instead — which answers a batch with a bare `{code: -32005}` array carrying
 * no per-entry `result` at all, leaving viem to blow up on `undefined` (see [CS-310]).
 *
 * `mockRpcNodeRequest` registers one of these automatically for every one of its callers, so
 * nothing needs to call this directly just to be found.
 */
export function registerRpcEntryResolver(context: BrowserContext, resolver: RpcEntryResolver): void {
  const resolvers = registry.get(context)
  if (resolvers) {
    resolvers.push(resolver)
  } else {
    registry.set(context, [resolver])
  }
}

/** Returns the first non-`undefined` answer from every resolver registered for `context`, newest
 * first so the mock that would have won Playwright's own LIFO route dispatch answers here too, or
 * `undefined` if none of them recognize this entry. `skip` excludes the caller's own resolver. */
export function resolveRpcEntry(context: BrowserContext, entry: JsonRpcEntry, skip?: RpcEntryResolver): unknown {
  const resolvers = registry.get(context) ?? []

  for (let i = resolvers.length - 1; i >= 0; i--) {
    const resolver = resolvers[i]
    if (resolver === skip) continue

    const result = resolver(entry)
    if (typeof result !== 'undefined') return result
  }

  return undefined
}
