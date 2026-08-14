import type { BrowserContext, Route } from '@playwright/test'

interface JsonRpcEntry {
  id: number | string
  method: string
}

export function mockRpcNodeRequest(
  context: BrowserContext,
  rpcMethod: string,
  resolve: (entry: JsonRpcEntry) => unknown,
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
      const payload = entries.map((entry) => ({ jsonrpc: '2.0', id: entry.id, result: resolve(entry) }))
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(Array.isArray(body) ? payload : payload[0]),
      })
    }

    return fulfillFromUpstream(route, entries, rpcMethod, resolve)
  })
}

async function fulfillFromUpstream(
  route: Route,
  entries: JsonRpcEntry[],
  rpcMethod: string,
  resolve: (entry: JsonRpcEntry) => unknown,
): Promise<void> {
  try {
    const upstream = await route.fetch()
    const upstreamBody = (await upstream.json()) as JsonRpcEntry | JsonRpcEntry[]
    const upstreamEntries = Array.isArray(upstreamBody) ? upstreamBody : [upstreamBody]
    const byId = new Map(entries.map((entry) => [entry.id, entry]))

    const payload = upstreamEntries.map((entry) => {
      const original = byId.get((entry as JsonRpcEntry).id)
      if (!original || original.method !== rpcMethod) return entry
      return { jsonrpc: '2.0', id: original.id, result: resolve(entry) }
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
