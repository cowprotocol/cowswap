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
  rpcMethod: string,
  resolve: (entry: JsonRpcEntry, upstreamResult?: unknown) => unknown,
): void {
  void context.route('**/*', async (route: Route) => {
    const request = route.request()
    if (request.method() !== 'POST') return route.fallback()

    let body: JsonRpcEntry | JsonRpcEntry[]
    try {
      body = request.postDataJSON() as JsonRpcEntry | JsonRpcEntry[]
    } catch {
      return route.fallback()
    }

    const entries = Array.isArray(body) ? body : [body]
    if (!entries.some((entry) => entry?.method === rpcMethod)) return route.fallback()

    if (entries.every((entry) => entry?.method === rpcMethod)) {
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

    return fulfillFromUpstream(route, entries, rpcMethod, resolve)
  })
}

async function fulfillFromUpstream(
  route: Route,
  entries: JsonRpcEntry[],
  rpcMethod: string,
  resolve: (entry: JsonRpcEntry, upstreamResult?: unknown) => unknown,
): Promise<void> {
  try {
    const upstream = await route.fetch()
    const upstreamBody = (await upstream.json()) as JsonRpcResult | JsonRpcResult[]
    const upstreamEntries = Array.isArray(upstreamBody) ? upstreamBody : [upstreamBody]
    const entriesById = new Map(entries.map((entry) => [entry.id, entry]))

    const payload = upstreamEntries.map((res) => {
      const entry = entriesById.get(res.id)

      if (!entry || entry.method !== rpcMethod) return res

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
