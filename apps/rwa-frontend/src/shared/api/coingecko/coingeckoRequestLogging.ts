import 'server-only'

import { subscribe } from 'node:diagnostics_channel'

import { type CoingeckoApi, getCoingeckoApi, toCoingeckoEndpoint } from './coingeckoEndpoint'

import { logger } from '../../lib/logger/index.server'

interface UndiciErrorMessage extends UndiciRequestMessage {
  error: unknown
}

interface UndiciHeadersMessage extends UndiciRequestMessage {
  response: { statusCode: number }
}

interface UndiciRequest {
  origin: string
  path: string
  method: string
}

interface UndiciRequestMessage {
  request: UndiciRequest
}

let isSubscribed = false

/**
 * Logs every request sent to CoinGecko and GeckoTerminal.
 * Hooks the `undici` diagnostics channels behind Node's `fetch` instead of `coingeckoClient`: a Next data cache hit
 * never reaches the network, and a stale entry is revalidated by Next in the background, out of the caller's sight.
 */
export function logCoingeckoRequests(): void {
  if (isSubscribed) return

  isSubscribed = true

  const startedAt = new WeakMap<UndiciRequest, number>()

  subscribe('undici:request:create', (message) => {
    const { request } = message as UndiciRequestMessage

    if (getRequestApi(request)) startedAt.set(request, performance.now())
  })

  subscribe('undici:request:headers', (message) => {
    const { request, response } = message as UndiciHeadersMessage
    const fields = getLogFields(request, startedAt)

    if (!fields) return

    const status = response.statusCode
    const isError = status >= 400

    logger[isError ? 'warn' : 'info']({ ...fields, status, outcome: isError ? 'http_error' : 'ok' }, 'upstream request')
  })

  subscribe('undici:request:error', (message) => {
    const { request, error } = message as UndiciErrorMessage
    const fields = getLogFields(request, startedAt)

    if (!fields) return

    logger.warn({ ...fields, outcome: 'network_error', err: error }, 'upstream request')
  })
}

function getLogFields(
  request: UndiciRequest,
  startedAt: WeakMap<UndiciRequest, number>,
): Record<string, string | number> | null {
  const api = getRequestApi(request)

  if (!api) return null

  const start = startedAt.get(request)
  startedAt.delete(request)

  return {
    upstream: 'coingecko',
    api,
    endpoint: toCoingeckoEndpoint(request.path),
    method: request.method,
    ...(start === undefined ? {} : { durationMs: Math.round(performance.now() - start) }),
  }
}

function getRequestApi(request: UndiciRequest): CoingeckoApi | null {
  return getCoingeckoApi(new URL(request.origin).host, Boolean(process.env.COINGECKO_API_KEY))
}
