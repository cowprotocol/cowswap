import { encodeAbiParameters } from 'viem'

import type { BrowserContext, Route } from '@playwright/test'

interface JsonRpcEntry {
  id: number | string
  method: string
  params?: [{ to?: string; data?: string }, ...unknown[]]
}

/** `nonces(address)` — EIP-2612's permit nonce. */
const NONCES_SELECTOR = '0x7ecebe00'
// No test in this suite asserts on the real on-chain nonce, only that one is present — a fixed
// value removes the real dependency entirely, same rationale as `installEthBlockNumber`.
const NONCE_RESULT = encodeAbiParameters([{ type: 'uint256' }], [1n])

/**
 * `eip2612Utils.getTokenNonce` reads a token's EIP-2612 permit nonce via a plain `eth_call` to
 * `nonces(address)`, routed through the app's own read-only `publicClient` — not the wallet's
 * provider (unlike `mockSocketVerifier.ts`'s SocketVerifier reads) — so it's a real page network
 * request, but to whichever real RPC/Infura host that client picked, not a URL this suite
 * controls. Matched by selector alone, host-agnostically, same technique as
 * `mockApproveSimulation.ts` uses for `approve()`: the nonce is faked to the same constant
 * regardless of which token or owner it's queried for.
 */
export function installTokenNonce(context: BrowserContext): void {
  void context.route('**/*', async (route: Route) => {
    const request = route.request()
    if (request.method() !== 'POST') return route.fallback()

    let body: JsonRpcEntry | JsonRpcEntry[] | null
    try {
      body = request.postDataJSON() as JsonRpcEntry | JsonRpcEntry[] | null
    } catch {
      return route.fallback()
    }
    if (!body) return route.fallback()

    const entries = Array.isArray(body) ? body : [body]
    const matches = entries.map(isNonceCall)
    if (!matches.some(Boolean)) return route.fallback()

    if (matches.every(Boolean)) {
      const payload = entries.map((entry) => ({ jsonrpc: '2.0', id: entry.id, result: NONCE_RESULT }))
      return route.fulfill({ json: Array.isArray(body) ? payload : payload[0] })
    }

    return fulfillFromUpstream(route, entries, matches)
  })
}

/** Same merge-with-upstream technique as `mockApproveSimulation.ts`. */
async function fulfillFromUpstream(route: Route, entries: JsonRpcEntry[], matches: boolean[]): Promise<void> {
  try {
    const upstream = await route.fetch()
    const upstreamBody = (await upstream.json()) as JsonRpcEntry | JsonRpcEntry[]
    const upstreamEntries = Array.isArray(upstreamBody) ? upstreamBody : [upstreamBody]
    const matchedIds = new Set(entries.filter((_, i) => matches[i]).map((entry) => entry.id))
    const payload = upstreamEntries.map((entry) =>
      matchedIds.has(entry.id) ? { jsonrpc: '2.0', id: entry.id, result: NONCE_RESULT } : entry,
    )
    await route.fulfill({ json: Array.isArray(upstreamBody) ? payload : payload[0] })
  } catch {
    await route.fallback()
  }
}

/** Matches any `eth_call` whose calldata is a `nonces(address)` invocation, regardless of `to`. */
function isNonceCall(entry: JsonRpcEntry | null | undefined): boolean {
  if (entry?.method !== 'eth_call') return false
  const call = entry.params?.[0]
  if (!call?.to || !call?.data) return false
  return call.data.toLowerCase().startsWith(NONCES_SELECTOR)
}
