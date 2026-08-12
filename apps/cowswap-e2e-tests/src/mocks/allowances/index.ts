import { type Hex } from 'viem'

import {
  classifyCall,
  encodeAllowanceResult,
  isFullyMocked,
  resolveBatchResult,
  type AllowanceCall,
  type BatchCall,
  type ClassifiedCall,
} from './codec'
import { loadAllowancesFixture, parseAllowanceValue } from './fixture'
import { hasAnyEntry, isOwnerConfigured, resolveAllowance } from './resolve'
import { normalizeRpcUrl, resolveRpcChainIds } from './rpcUrls'
import { allowanceKey, type AllowanceLookup, type AllowanceRead, type AllowanceValue } from './types'

import type { BrowserContext, Route } from '@playwright/test'

export type { AllowanceRead, AllowanceValue }

export interface AllowancesMock {
  /**
   * Merge raw-atom allowances into `(owner, chainId)`, token by token.
   *
   * The supported way to key on `wallet.address`, which is not knowable when the
   * committed fixture is written. Tokens not named keep their fixture value.
   */
  set(owner: string, chainId: number, allowances: Record<string, AllowanceValue>): void
  /** Drop every override, restoring the committed fixture. */
  clear(): void
  /** Every allowance read seen on the wire this test, in order. */
  reads(): readonly AllowanceRead[]
  /** Non-fatal warning about queried-but-unconfigured owners and decode failures. */
  reportUnknownOwners(): void
  reset(): void
  /**
   * Resolve one already-decoded allowance read against the live fixture+override state, bypassing
   * the URL-scoped route handler below entirely. Used by `mocks/multicall3.ts`'s host-agnostic
   * `aggregate3` handler, which needs the exact same "override wins, else fixture, else 0" answer
   * regardless of which real RPC host the app's independent read-only client happened to pick for a
   * given batch — going through the same `resolveFor` the route handler itself uses keeps
   * `reads()`/`reportUnknownOwners()` bookkeeping accurate no matter which handler answered.
   */
  resolve(chainId: number, call: AllowanceCall): bigint
}

interface JsonRpcEntry {
  id?: number | string
  method?: string
  params?: unknown[]
}

// eslint-disable-next-line max-lines-per-function
export function installAllowances(context: BrowserContext): AllowancesMock {
  const fixture = loadAllowancesFixture()
  const overrides: AllowanceLookup = new Map()
  const reads: AllowanceRead[] = []
  const unknownOwners = new Set<string>()
  const problems: string[] = []

  const chainIdByUrl = resolveRpcChainIds()

  if (chainIdByUrl.size === 0) {
    console.warn(
      '[allowances mock] No REACT_APP_NETWORK_URL_<chainId> env var is set, so no RPC traffic is intercepted ' +
        'and allowances come from the real node. The suite requires REACT_APP_NETWORK_URL_11155111.',
    )
  }

  function resolveFor(chainId: number, call: AllowanceCall): bigint {
    const value = resolveAllowance(fixture, overrides, call.owner, chainId, call.token)

    reads.push({ chainId, owner: call.owner, spender: call.spender, token: call.token, value })

    if (hasAnyEntry(fixture, overrides) && !isOwnerConfigured(fixture, overrides, call.owner)) {
      unknownOwners.add(call.owner)
    }

    return value
  }

  const handler = async (route: Route): Promise<void> => {
    const chainId = chainIdOf(route, chainIdByUrl)
    if (chainId === undefined) return route.continue()

    const body = parseBody(route)
    if (body === undefined) return route.continue()

    const entries = Array.isArray(body) ? (body as JsonRpcEntry[]) : [body as JsonRpcEntry]
    const classified = entries.map(classifyEntry)

    if (classified.every((call) => call === undefined || call.kind === 'opaque')) {
      return route.continue()
    }

    try {
      if (classified.every((call) => call !== undefined && isFullyMocked(call))) {
        const payload = entries.map((entry, index) => ({
          jsonrpc: '2.0',
          id: entry.id ?? null,
          result: localResult(classified[index] as ClassifiedCall, chainId, resolveFor),
        }))
        return await fulfillJson(route, Array.isArray(body) ? payload : payload[0])
      }

      const upstream = await route.fetch()
      const upstreamBody = (await upstream.json()) as unknown
      const upstreamEntries = Array.isArray(upstreamBody) ? (upstreamBody as JsonRpcEntry[]) : [upstreamBody]

      // A JSON-RPC batch response is not required to preserve request order, so match
      // by id and fall back to positional only when an id is missing.
      const byId = new Map<number | string, ClassifiedCall | undefined>()
      entries.forEach((entry, index) => {
        if (entry.id !== undefined) byId.set(entry.id, classified[index])
      })

      const payload = upstreamEntries.map((entry, index) => {
        const id = (entry as JsonRpcEntry).id
        const call = id !== undefined && byId.has(id) ? byId.get(id) : classified[index]
        return patchEntry(entry as Record<string, unknown>, call, chainId, resolveFor)
      })

      return await fulfillJson(route, Array.isArray(upstreamBody) ? payload : payload[0])
    } catch (error) {
      // Never leave the page hanging on a mock bug: the request goes through untouched
      // and the reason surfaces in the teardown report.
      problems.push(`${route.request().url()}: ${String(error)}`)
      return route.continue()
    }
  }

  void context.route((url) => chainIdByUrl.has(safeNormalize(url.href)), handler)

  return {
    set(owner, chainId, allowances) {
      for (const [token, value] of Object.entries(allowances)) {
        const where = `allowances.set("${owner}", ${chainId}, { "${token}" })`
        overrides.set(allowanceKey(owner, chainId, token), parseAllowanceValue(value, where))
      }
    },
    clear() {
      overrides.clear()
    },
    reads() {
      return reads
    },
    reportUnknownOwners() {
      if (unknownOwners.size > 0) {
        const list = [...unknownOwners].map((owner) => `  - ${owner}`).join('\n')
        console.warn(
          `[allowances mock] allowances were read for owners with no entry, so they resolved to 0:\n${list}\n` +
            `Add them to src/mocks/allowances/fixtures/allowances.json, or call ` +
            `mocks.allowances.set(wallet.address, chainId, { ... }) in the spec.`,
        )
      }

      if (problems.length > 0) {
        const list = problems.map((problem) => `  - ${problem}`).join('\n')
        console.warn(`[allowances mock] requests forwarded untouched after a mock error:\n${list}`)
      }
    },
    reset() {
      overrides.clear()
      reads.length = 0
      unknownOwners.clear()
      problems.length = 0
    },
    resolve(chainId, call) {
      return resolveFor(chainId, call)
    },
  }
}

function chainIdOf(route: Route, chainIdByUrl: Map<string, number>): number | undefined {
  return chainIdByUrl.get(safeNormalize(route.request().url()))
}

function classifyEntry(entry: JsonRpcEntry): ClassifiedCall | undefined {
  if (entry.method !== 'eth_call') return undefined

  const target = entry.params?.[0]
  if (typeof target !== 'object' || target === null) return undefined

  const { to, data } = target as { to?: unknown; data?: unknown }
  if (typeof to !== 'string' || typeof data !== 'string') return undefined

  return classifyCall(to, data)
}

async function fulfillJson(route: Route, body: unknown): Promise<void> {
  await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) })
}

function localResult(
  call: ClassifiedCall,
  chainId: number,
  resolve: (chainId: number, call: AllowanceCall) => bigint,
): Hex {
  if (call.kind === 'allowance') return encodeAllowanceResult(resolve(chainId, call))
  return resolveBatchResult(call as BatchCall, (inner) => resolve(chainId, inner))
}

function parseBody(route: Route): unknown {
  try {
    return route.request().postDataJSON() as unknown
  } catch {
    return undefined
  }
}

function patchEntry(
  entry: Record<string, unknown>,
  call: ClassifiedCall | undefined,
  chainId: number,
  resolve: (chainId: number, call: AllowanceCall) => bigint,
): unknown {
  if (call === undefined || call.kind === 'opaque') return entry

  if (call.kind === 'allowance') {
    return { ...entry, error: undefined, result: encodeAllowanceResult(resolve(chainId, call)) }
  }

  const upstreamResult = typeof entry.result === 'string' ? (entry.result as Hex) : undefined

  return {
    ...entry,
    error: undefined,
    result: resolveBatchResult(call, (inner) => resolve(chainId, inner), upstreamResult),
  }
}

function safeNormalize(url: string): string {
  try {
    return normalizeRpcUrl(url)
  } catch {
    return url
  }
}
