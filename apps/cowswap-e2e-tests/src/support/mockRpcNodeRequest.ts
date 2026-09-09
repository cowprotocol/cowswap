import type { Address, Hex } from 'viem'

import type { BrowserContext, Route } from '@playwright/test'

export interface JsonRpcEntry {
  id: number | string
  method: string
  params: unknown[]
}

export interface JsonRpcResult<T = unknown> {
  id: number | string
  jsonrpc: string
  result: T
}

export interface TransactionParams {
  to: Address
  data: Hex
  value?: string
  gas?: string
  gasLimit?: string
}

export function mockRpcNodeRequest(
  context: BrowserContext,
  rpcMethods: string | readonly string[],
  resolve: (entry: JsonRpcEntry, upstreamResult?: unknown) => unknown,
  matches: (entry: JsonRpcEntry) => boolean,
  // Host-agnostic by default: the app's own real-RPC traffic doesn't reliably go through any one
  // configured URL (see AGENTS.md), so most callers want every host. A caller that instead scopes
  // to one known RPC endpoint (e.g. `installNativeBalanceRoute`'s `rpcUrl`) can override this.
  urlPattern: string | RegExp = '**/*',
): void {
  const methods = new Set(Array.isArray(rpcMethods) ? rpcMethods : [rpcMethods as string])
  const isOwnMethod = (entry: JsonRpcEntry): boolean => methods.has(entry?.method)

  void context.route(urlPattern, async (route: Route) => {
    const request = route.request()
    if (request.method() !== 'POST') return route.fallback()

    let body: JsonRpcEntry | JsonRpcEntry[]
    try {
      body = request.postDataJSON() as JsonRpcEntry | JsonRpcEntry[]
    } catch {
      return route.fallback()
    }

    const entries = Array.isArray(body) ? body : [body]
    // Method-name match alone isn't enough: several mocks share `eth_call`, and
    // `context.route('**/*', ...)` dispatches them LIFO. Without checking whether this mock's own
    // selector actually appears anywhere in the request, a later-registered mock would swallow
    // every `eth_call` it sees via `fulfillFromUpstream` below — a real network fetch that never
    // reaches `route.fallback()` — starving any earlier-registered mock (e.g. `allowances`) of the
    // request entirely, even though it was never relevant to this mock in the first place.
    if (!entries.some((entry) => isOwnMethod(entry) && matches(entry))) return route.fallback()

    if (entries.every(isOwnMethod)) {
      const results = entries.map((entry) => resolve(entry))

      if (results.every((res) => typeof res !== 'undefined')) {
        const payload = entries.map((entry, i) => ({ jsonrpc: '2.0', id: entry.id, result: results[i] }))

        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(Array.isArray(body) ? payload : payload[0]),
        })
      }
    }

    return fulfillFromUpstream(route, entries, Array.isArray(body), isOwnMethod, resolve)
  })
}

async function fulfillFromUpstream(
  route: Route,
  entries: JsonRpcEntry[],
  isRequestBatched: boolean,
  isOwnMethod: (entry: JsonRpcEntry) => boolean,
  resolve: (entry: JsonRpcEntry, upstreamResult?: unknown) => unknown,
): Promise<void> {
  try {
    const upstream = await route.fetch()
    const upstreamBody = (await upstream.json()) as JsonRpcResult | JsonRpcResult[] | unknown
    const upstreamEntries = Array.isArray(upstreamBody) ? upstreamBody : [upstreamBody]
    const upstreamById = new Map(
      upstreamEntries
        .filter((res): res is JsonRpcResult => typeof res === 'object' && res !== null && 'id' in res)
        .map((res) => [res.id, res]),
    )

    // Driven by OUR entries, not the upstream ones: a real, rate-limited or otherwise erroring
    // upstream can reply with a shape that doesn't carry a matching `id` per entry at all (a bare
    // `{code, message}` rate-limit body, observed from Infura, rather than a proper per-id
    // JSON-RPC error) — iterating the upstream array and looking entries up by `res.id` then
    // silently failed to find a match and relayed that raw, unmapped body straight through,
    // discarding this mock's already-correct answer for every entry in the same batch (including
    // ones nothing about the failed entry had anything to do with — see [CS-310]). Falling back to
    // positional pairing when an id can't be matched, and always calling `resolve()` regardless of
    // whether an upstream counterpart was found, means a real upstream failure can only cost the
    // specific entries this mock genuinely can't answer on its own.
    const payload = entries.map((entry, i) => {
      const upstreamEntry = upstreamById.get(entry.id) ?? (upstreamEntries[i] as JsonRpcResult | undefined)

      if (!isOwnMethod(entry)) return upstreamEntry ?? entry

      // `null` (never `undefined`) signals "upstream was attempted for this entry" to `resolve()` —
      // `mockContractViewCall`'s own multicall merge relies on that distinction to tell "haven't
      // fetched upstream yet, ask for a retry" apart from "fetched it, nothing usable came back" —
      // this call only ever happens after a real `route.fetch()`, so it's always the latter.
      const result = resolve(entry, upstreamEntry?.result ?? null)

      if (typeof result === 'undefined') return upstreamEntry ?? entry

      return { jsonrpc: '2.0', id: entry.id, result }
    })

    // Shaped after OUR request, not the upstream response — a malformed upstream body (the same
    // rate-limit error above happens to arrive as a bare array) must not turn a single-object
    // request into an array response the caller never asked for.
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(isRequestBatched ? payload : payload[0]),
    })
  } catch {
    await route.fallback()
  }
}
