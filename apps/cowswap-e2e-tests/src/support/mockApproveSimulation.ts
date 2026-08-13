import { APPROVE_CALL_SUCCESS_RESULT, APPROVE_SELECTOR } from './mockApproveTransaction'

import type { BrowserContext, Route } from '@playwright/test'

interface JsonRpcEntry {
  id: number | string
  method: string
  params?: [{ to?: string; data?: string }, ...unknown[]]
}

/**
 * Answers the preflight `approve(address,uint256)` simulation `eth_call` (see
 * `mockApproveTransaction.ts`'s doc comment) for every trade that pre-seeds a sufficient
 * allowance via `seedTrader`/`mocks.allowances.set` and therefore never calls
 * `mockApproveTransaction` at all — the wallet-connector layer still fires this simulate-before-
 * sign check regardless of whether the UI ever shows an Approve step, and confirmed by tracing
 * real traffic (`LOG_UNMOCKED_RPC=1`), it goes to the app's own hardcoded provider rather than any
 * URL this suite controls, so it needs the same host-agnostic matching `mockSocketVerifier.ts`
 * uses. Unlike `mockApproveTransaction`'s own per-token simulation stub, this one matches on the
 * selector alone — an ERC20 `approve()` call succeeding is safe to assume unconditionally
 * regardless of which token/spender it targets, and no test in this suite depends on one
 * reverting.
 */
export function mockApproveSimulation(context: BrowserContext): void {
  void context.route('**/*', async (route: Route) => {
    const request = route.request()
    if (request.method() !== 'POST') return route.fallback()

    let body: JsonRpcEntry | JsonRpcEntry[] | null
    try {
      // Same rationale as `mockApproveTransaction.ts`'s own preflight handler: this route sees
      // every request in the page, so a POST with no/non-JSON body (e.g. an analytics beacon)
      // must be checked explicitly rather than relying on a try/catch alone.
      body = request.postDataJSON() as JsonRpcEntry | JsonRpcEntry[] | null
    } catch {
      return route.fallback()
    }
    if (!body) return route.fallback()

    const entries = Array.isArray(body) ? body : [body]
    const matches = entries.map(isApproveSimulationCall)
    if (!matches.some(Boolean)) return route.fallback()

    if (matches.every(Boolean)) {
      const payload = entries.map((entry) => ({ jsonrpc: '2.0', id: entry.id, result: APPROVE_CALL_SUCCESS_RESULT }))
      return route.fulfill({ json: Array.isArray(body) ? payload : payload[0] })
    }

    return fulfillFromUpstream(route, entries, matches)
  })
}

/** Same merge-with-upstream technique as `mockApproveTransaction.ts`'s own preflight handler. */
async function fulfillFromUpstream(route: Route, entries: JsonRpcEntry[], matches: boolean[]): Promise<void> {
  try {
    const upstream = await route.fetch()
    const upstreamBody = (await upstream.json()) as JsonRpcEntry | JsonRpcEntry[]
    const upstreamEntries = Array.isArray(upstreamBody) ? upstreamBody : [upstreamBody]
    const matchedIds = new Set(entries.filter((_, i) => matches[i]).map((entry) => entry.id))
    const payload = upstreamEntries.map((entry) =>
      matchedIds.has(entry.id) ? { jsonrpc: '2.0', id: entry.id, result: APPROVE_CALL_SUCCESS_RESULT } : entry,
    )
    await route.fulfill({ json: Array.isArray(upstreamBody) ? payload : payload[0] })
  } catch {
    await route.fallback()
  }
}

/** Matches any `eth_call` whose calldata is an `approve(address,uint256)` invocation, regardless of `to`. */
function isApproveSimulationCall(entry: JsonRpcEntry | null | undefined): boolean {
  if (entry?.method !== 'eth_call') return false
  const call = entry.params?.[0]
  if (!call?.to || !call?.data) return false
  return call.data.toLowerCase().startsWith(APPROVE_SELECTOR)
}
