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

    return fulfillFromUpstream(route, entries, isOwnMethod, resolve)
  })
}

async function fulfillFromUpstream(
  route: Route,
  entries: JsonRpcEntry[],
  isOwnMethod: (entry: JsonRpcEntry) => boolean,
  resolve: (entry: JsonRpcEntry, upstreamResult?: unknown) => unknown,
): Promise<void> {
  try {
    const upstream = await route.fetch()
    const upstreamBody = (await upstream.json()) as JsonRpcResult | JsonRpcResult[]
    const upstreamEntries = Array.isArray(upstreamBody) ? upstreamBody : [upstreamBody]
    const entriesById = new Map(entries.map((entry) => [entry.id, entry]))

    const payload = upstreamEntries.map((res) => {
      const entry = entriesById.get(res.id)

      if (!entry || !isOwnMethod(entry)) return res

      const result = resolve(entry, res.result)

      if (typeof result === 'undefined') return res

      return { jsonrpc: '2.0', id: entry.id, result }
    })

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(Array.isArray(upstreamBody) ? payload : payload[0]),
    })
  } catch {
    await route.fallback()
  }
}
