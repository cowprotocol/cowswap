import type { BrowserContext, Route } from '@playwright/test'

export interface EthGetCodeMock {
  /** Override the bytecode reported for `address` — e.g. a non-`'0x'` value to simulate a
   * smart-contract wallet instead of the default plain EOA. */
  set(address: string, code: string): void
  /** Drop every override, back to `'0x'` (plain EOA) for every address. */
  reset(): void
}

interface JsonRpcEntry {
  id: number | string
  method: string
  params?: [address?: string, ...unknown[]]
}

/**
 * `eth_getCode` (wallet-type detection, e.g. `useIsSmartContractWallet`-style checks run for the
 * connected wallet on most page loads) goes out as a single, standalone JSON-RPC call to whichever
 * real RPC/Infura endpoint the app's own independent client picked — not the wallet's own
 * `REACT_APP_NETWORK_URL_<chainId>`-overridden channel, and not batched via Multicall3 either (it's
 * its own top-level RPC method, not a contract `eth_call`), so none of the other mocks ever see it.
 * Traced with `logUnmockedRpcRequests`/`LOG_UNMOCKED_RPC=1`: it accounted for the large majority of
 * 429s from a real, rate-limited Infura key once enough parallel workers hit it at once under
 * `pnpm e2e`. This suite's mock wallet is always a plain EOA, so reporting no code (`'0x'`) for
 * every address by default removes that real dependency entirely. `set()` is there for a future
 * test that needs to simulate a smart-contract wallet instead.
 */
export function installEthGetCode(context: BrowserContext): EthGetCodeMock {
  const overrides = new Map<string, string>()

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
    if (!entries.some((entry) => entry?.method === 'eth_getCode')) return route.fallback()

    if (entries.every((entry) => entry?.method === 'eth_getCode')) {
      const payload = entries.map((entry) => ({
        jsonrpc: '2.0',
        id: entry.id,
        result: resolveCode(entry, overrides),
      }))
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(Array.isArray(body) ? payload : payload[0]),
      })
    }

    return fulfillFromUpstream(route, entries, overrides)
  })

  return {
    set(address, code) {
      overrides.set(address.toLowerCase(), code)
    },
    reset() {
      overrides.clear()
    },
  }
}

/**
 * A mixed batch alongside something else this mock doesn't own — patch only the `eth_getCode`
 * slots and merge with the real response for the rest, with the same defensive try/catch as the
 * allowances/SocketVerifier mocks so a flaky real upstream can't take the whole batch down.
 */
async function fulfillFromUpstream(
  route: Route,
  entries: JsonRpcEntry[],
  overrides: Map<string, string>,
): Promise<void> {
  try {
    const upstream = await route.fetch()
    const upstreamBody = (await upstream.json()) as JsonRpcEntry | JsonRpcEntry[]
    const upstreamEntries = Array.isArray(upstreamBody) ? upstreamBody : [upstreamBody]
    const byId = new Map(entries.map((entry) => [entry.id, entry]))

    const payload = upstreamEntries.map((entry) => {
      const original = byId.get((entry as JsonRpcEntry).id)
      if (!original || original.method !== 'eth_getCode') return entry
      return { jsonrpc: '2.0', id: original.id, result: resolveCode(original, overrides) }
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

function resolveCode(entry: JsonRpcEntry, overrides: Map<string, string>): string {
  const address = entry.params?.[0]
  const override = address ? overrides.get(address.toLowerCase()) : undefined
  return override ?? '0x'
}
