import type { BrowserContext, Route } from '@playwright/test'

interface JsonRpcEntry {
  id: number | string
  method: string
}

// This suite's test wallets are always fresh (a nonce of 0 is genuinely accurate, not just
// convenient), so a single hardcoded value covers every address/block-tag combination.
const HARDCODED_TRANSACTION_COUNT = '0x0'

/**
 * `eth_getTransactionCount` (the wallet's own nonce) goes out as a single, standalone JSON-RPC call
 * (no Multicall3 batching, same as `eth_blockNumber`/`eth_getCode`) to whichever real RPC/Infura
 * endpoint the app's own independent client picked. Traced with
 * `logUnmockedRpcRequests`/`LOG_UNMOCKED_RPC=1`: same class of real, rate-limited dependency as
 * `eth_blockNumber` (`installEthBlockNumber`) that 429s under `pnpm e2e`'s full parallel load.
 */
export function installEthGetTransactionCount(context: BrowserContext): void {
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
    if (!entries.some((entry) => entry?.method === 'eth_getTransactionCount')) return route.fallback()

    if (entries.every((entry) => entry?.method === 'eth_getTransactionCount')) {
      const payload = entries.map((entry) => ({ jsonrpc: '2.0', id: entry.id, result: HARDCODED_TRANSACTION_COUNT }))
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(Array.isArray(body) ? payload : payload[0]),
      })
    }

    return fulfillFromUpstream(route, entries)
  })
}

/**
 * A mixed batch alongside something else this mock doesn't own — patch only the
 * `eth_getTransactionCount` slots and merge with the real response for the rest, with the same
 * defensive try/catch as the allowances/SocketVerifier mocks so a flaky real upstream can't take
 * the whole batch down.
 */
async function fulfillFromUpstream(route: Route, entries: JsonRpcEntry[]): Promise<void> {
  try {
    const upstream = await route.fetch()
    const upstreamBody = (await upstream.json()) as JsonRpcEntry | JsonRpcEntry[]
    const upstreamEntries = Array.isArray(upstreamBody) ? upstreamBody : [upstreamBody]
    const byId = new Map(entries.map((entry) => [entry.id, entry]))

    const payload = upstreamEntries.map((entry) => {
      const original = byId.get((entry as JsonRpcEntry).id)
      if (!original || original.method !== 'eth_getTransactionCount') return entry
      return { jsonrpc: '2.0', id: original.id, result: HARDCODED_TRANSACTION_COUNT }
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
