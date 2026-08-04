import { loadBalancesFixture, parseBalanceValue } from './fixture'
import { hasAnyEntry, isOwnerConfigured, resolveBalancesSnapshot } from './resolve'
import { balanceKey, type BalanceLookup, type BalancesSessionRequest, type BalanceValue } from './types'

import type { BrowserContext, Route } from '@playwright/test'

export type { BalancesSessionRequest, BalanceValue }

/** Matches both the production and barn balances-watcher hosts — see `BALANCES_WATCHER_BASE_URL` in `@cowprotocol/common-const`. */
const BALANCES_WATCHER_URL_PATTERN = /^https:\/\/balances-watcher(?:\.barn)?\.cow\.fi\//

const SESSION_PATH = /^\/(\d+)\/sessions\/(0x[a-fA-F0-9]{40})$/i
const SSE_PATH = /^\/sse\/(\d+)\/balances\/(0x[a-fA-F0-9]{40})$/i

export interface BalancesMock {
  /**
   * Merge raw-atom balances into `(owner, chainId)`, token by token.
   *
   * Overwrites the SSE snapshot the next time the app (re)connects — the
   * committed fixture's tokens keep their fixture value unless named here.
   */
  set(owner: string, chainId: number, balances: Record<string, BalanceValue>): void
  /** Drop every override, restoring the committed fixture. */
  clear(): void
  /** Every `POST /{chainId}/sessions/{owner}` observed on the wire this test, in order. */
  sessions(): readonly BalancesSessionRequest[]
  /** Non-fatal warning about SSE connections opened for an owner/chain with no entry. */
  reportUnknownOwners(): void
  reset(): void
}

export function installBalances(context: BrowserContext): BalancesMock {
  const fixture = loadBalancesFixture()
  const overrides: BalanceLookup = new Map()
  const sessions: BalancesSessionRequest[] = []
  const unknownOwners = new Set<string>()

  const handler = async (route: Route): Promise<void> => {
    const request = route.request()
    const url = new URL(request.url())

    const sessionMatch = SESSION_PATH.exec(url.pathname)
    if (sessionMatch && request.method() === 'POST') {
      return handleSession(route, sessions, Number(sessionMatch[1]), sessionMatch[2] as string)
    }

    const sseMatch = SSE_PATH.exec(url.pathname)
    if (sseMatch && request.method() === 'GET') {
      const chainId = Number(sseMatch[1])
      const owner = sseMatch[2] as string
      if (hasAnyEntry(fixture, overrides) && !isOwnerConfigured(fixture, overrides, owner, chainId)) {
        unknownOwners.add(`${owner} (chain ${chainId})`)
      }
      return handleSse(route, fixture, overrides, chainId, owner)
    }

    return route.fallback()
  }

  void context.route(BALANCES_WATCHER_URL_PATTERN, handler)

  return {
    set(owner, chainId, balances) {
      for (const [token, value] of Object.entries(balances)) {
        const where = `balances.set("${owner}", ${chainId}, { "${token}" })`
        overrides.set(balanceKey(owner, chainId, token), parseBalanceValue(value, where))
      }
    },
    clear() {
      overrides.clear()
    },
    sessions() {
      return sessions
    },
    reportUnknownOwners() {
      if (unknownOwners.size === 0) return
      const list = [...unknownOwners].map((owner) => `  - ${owner}`).join('\n')
      console.warn(
        `[balances mock] the SSE stream was opened for owners with no entry, so they resolved to an empty snapshot:\n${list}\n` +
          `Add them to src/mocks/balances/fixtures/balances.json, or call ` +
          `mocks.balances.set(wallet.address, chainId, { ... }) in the spec.`,
      )
    },
    reset() {
      overrides.clear()
      sessions.length = 0
      unknownOwners.clear()
    },
  }
}

async function handleSession(
  route: Route,
  sessions: BalancesSessionRequest[],
  chainId: number,
  owner: string,
): Promise<void> {
  const body = parseBody(route)
  sessions.push({
    chainId,
    owner,
    tokensListsUrls: Array.isArray(body?.tokensListsUrls) ? (body.tokensListsUrls as string[]) : [],
    customTokens: Array.isArray(body?.customTokens) ? (body.customTokens as string[]) : [],
  })
  await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
}

async function handleSse(
  route: Route,
  fixture: BalanceLookup,
  overrides: BalanceLookup,
  chainId: number,
  owner: string,
): Promise<void> {
  const snapshot = resolveBalancesSnapshot(fixture, overrides, owner, chainId)
  // Slow the browser's default auto-reconnect (~3s) so a route re-fulfil doesn't
  // repeatedly re-fire for the rest of the test; each reconnect just re-sends the
  // same snapshot anyway.
  const body = `retry: 3000\nevent: balance_update\ndata: ${JSON.stringify({ balances: snapshot })}\n\n`

  await route.fulfill({ status: 200, contentType: 'text/event-stream', body })
}

function parseBody(route: Route): Record<string, unknown> | undefined {
  try {
    return route.request().postDataJSON() as Record<string, unknown>
  } catch {
    return undefined
  }
}
