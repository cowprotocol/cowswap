import { appendFile, mkdir } from 'node:fs/promises'
import path from 'node:path'

import type { APIResponse, BrowserContext, Route } from '@playwright/test'

export interface UnmockedRpcLoggerOpts {
  context: BrowserContext
  worker: number
  test: string
  logPath?: string
}

export interface UnmockedRpcRequestLogEntry {
  timestamp: string
  worker: number
  test: string
  url: string
  request: unknown
  status: number
  response: unknown
  durationMs: number
  error?: string
}

const DEFAULT_LOG_PATH = path.join('test-results', 'unmocked-rpc-requests.log')

/**
 * Diagnostic tool for CC-03/CC-26/CC-27-style flakiness ("Error loading price" under `pnpm e2e`'s
 * full parallel load, not reproducible running one test at a time): several mocks
 * (`mockSocketVerifier`, `mocks.allowances`, ...) fall back to a real `route.fetch()` against
 * whatever real RPC the app picked (e.g. `ethereum-rpc.publicnode.com`) whenever a batch isn't
 * *fully* recognized — reliable for one test, but exactly the kind of real, rate-limited
 * dependency that starts 429-ing once dozens of parallel workers hit it at once.
 *
 * Enable with `LOG_UNMOCKED_RPC=1`. Registers a catch-all route with the lowest possible priority
 * — call this before installing any other mock (first thing in the `mocks` fixture) so every
 * other, more specific handler gets first refusal via `route.fallback()`. Whatever reaches this
 * one is, by construction, not mocked by anything else. For JSON-RPC-shaped bodies (the shape
 * every blockchain RPC call in this suite uses — CoW API/Bungee/etc. traffic has different shapes
 * and is already excluded), it performs the real request itself, logs the request and the real
 * response (status, body — including a real 429) as one JSON line to `logPath`, then fulfills with
 * that same real response so test behavior is completely unchanged; this is observation-only.
 */
export function logUnmockedRpcRequests(opts: UnmockedRpcLoggerOpts): void {
  const { context, worker, test, logPath = DEFAULT_LOG_PATH } = opts

  void context.route('**/*', async (route: Route) => {
    const request = route.request()
    if (request.method() !== 'POST') return route.fallback()

    let body: unknown
    try {
      body = request.postDataJSON()
    } catch {
      return route.fallback()
    }
    if (!looksLikeJsonRpc(body)) return route.fallback()

    const startedAt = Date.now()
    try {
      const response = await route.fetch()
      const responseBody = await readBody(response)
      void appendEntry(logPath, {
        timestamp: new Date(startedAt).toISOString(),
        worker,
        test,
        url: request.url(),
        request: body,
        status: response.status(),
        response: responseBody,
        durationMs: Date.now() - startedAt,
      })
      await route.fulfill({ response })
    } catch (error) {
      void appendEntry(logPath, {
        timestamp: new Date(startedAt).toISOString(),
        worker,
        test,
        url: request.url(),
        request: body,
        status: 0,
        response: null,
        durationMs: Date.now() - startedAt,
        error: String(error),
      })
      await route.fallback()
    }
  })
}

/** Best-effort: a logging failure must never break the real request it's observing. */
async function appendEntry(logPath: string, entry: UnmockedRpcRequestLogEntry): Promise<void> {
  try {
    await mkdir(path.dirname(logPath), { recursive: true })
    await appendFile(logPath, `${JSON.stringify(entry)}\n`, 'utf8')
  } catch {
    // Diagnostic logging is best-effort only.
  }
}

function looksLikeJsonRpc(body: unknown): boolean {
  const isEntry = (entry: unknown): boolean =>
    typeof entry === 'object' && entry !== null && typeof (entry as { method?: unknown }).method === 'string'

  return Array.isArray(body) ? body.length > 0 && body.every(isEntry) : isEntry(body)
}

async function readBody(response: APIResponse): Promise<unknown> {
  const text = await response.text()
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}
