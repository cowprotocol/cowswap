// REST base comes from REACT_APP_GRAFFITI_API, defaulting to same-origin '/v1'.
// The WS URL is derived from it: relative → current host, absolute → its own.

import { GRAFFITI_API_BASE, GRAFFITI_API_RAW_BASE, GRAFFITI_CANVAS_PNG_URL } from '@cowprotocol/common-const'

import type { Cell } from './raster.utils'

/** REST base, no trailing slash. */
export const API_BASE = GRAFFITI_API_BASE

/** Abort a request that has not responded in this long. */
const REQUEST_TIMEOUT_MS = 20_000
/** A claim waits on the treasury's transfer being confirmed on mainnet, which 20s does not cover. */
const CLAIM_TIMEOUT_MS = 90_000

export interface CanvasInfo {
  width: number
  height: number
  maxBoxWidth?: number
  maxBoxHeight?: number
  maxCellsPerDraw?: number
  mint: string | null
  treasury: string | null
  network: string
  devInsecure?: boolean
}

export interface CellsResponse {
  seq: number
  cells: Array<[number, number, number]> // [x, y, rgb]
  hasMore?: boolean
}

export interface ClaimInfoResponse {
  valid: boolean
  amount: number
}

export interface ClaimResponse {
  ok: boolean
  txSignature: string
  amount: number
}

export interface DrawResponse {
  ok: boolean
  seq: number
}

export type WsMessage =
  | { type: 'diff'; seq: number; cells: Array<[number, number, number]> }
  | { type: 'stats'; paintersOnline: number }

/** A backend rejection, carrying whether the same request may be retried. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly retryable: boolean,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function explorerTxUrl(signature: string, network: string): string {
  const cluster = network === 'mainnet' || network === 'mainnet-beta' ? '' : `?cluster=${network}`

  return `https://explorer.solana.com/tx/${signature}${cluster}`
}

export async function fetchCanvasPng(width: number, height: number): Promise<Uint8ClampedArray> {
  const res = await fetch(GRAFFITI_CANVAS_PNG_URL)

  if (!res.ok) throw new Error(`canvas.png: HTTP ${res.status}`)

  const blob = await res.blob()
  const bitmap = await createImageBitmap(blob)

  try {
    const offscreen = document.createElement('canvas')

    offscreen.width = width
    offscreen.height = height

    const ctx = offscreen.getContext('2d', { willReadFrequently: true })

    if (!ctx) throw new Error('no 2d context')

    ctx.drawImage(bitmap, 0, 0)

    const { data } = ctx.getImageData(0, 0, width, height)

    // The PNG's own alpha is unreliable, and black is the wall's unpainted/erased
    // value: those cells stay transparent so the page background shows through.
    for (let i = 0; i < data.length; i += 4) {
      data[i + 3] = data[i] === 0 && data[i + 1] === 0 && data[i + 2] === 0 ? 0 : 255
    }

    return data
  } finally {
    bitmap.close()
  }
}

/**
 * Every cell written after `seq`. The backend caps one page, so a client that
 * stops at the first response renders a partial wall and believes it current.
 */
export async function getAllCellsSince(seq: number): Promise<CellsResponse> {
  const cells: Array<[number, number, number]> = []
  let cursor = seq

  for (let page = 0; page < 100; page++) {
    const res = await getCellsSince(cursor)

    cells.push(...res.cells)
    cursor = res.seq

    if (!res.hasMore || res.cells.length === 0) break
  }

  return { seq: cursor, cells }
}

export function getCellsSince(seq: number): Promise<CellsResponse> {
  return jsonFetch<CellsResponse>(`${API_BASE}/cells?since=${seq}`)
}

export function getClaimInfo(code: string): Promise<ClaimInfoResponse> {
  return jsonFetch<ClaimInfoResponse>(`${API_BASE}/claim/${encodeURIComponent(code)}`)
}

export function getInfo(): Promise<CanvasInfo> {
  return jsonFetch<CanvasInfo>(`${API_BASE}/info`)
}

export function postClaim(payload: { code: string; walletPubkey: string }): Promise<ClaimResponse> {
  return jsonFetch<ClaimResponse>(
    `${API_BASE}/claim`,
    { method: 'POST', body: JSON.stringify(payload) },
    CLAIM_TIMEOUT_MS,
  )
}

/** Never rejects: reporting must not break the paint flow. */
export function postClientError(payload: {
  message: string
  phase?: string
  wallet?: string
  detail?: string
}): Promise<void> {
  return fetch(`${API_BASE}/client-errors`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  })
    .then(() => undefined)
    .catch(() => undefined) // never let reporting break the app
}

export function postDraw(payload: {
  txSignature: string
  walletPubkey: string
  cells: Array<Cell>
}): Promise<DrawResponse> {
  return jsonFetch<DrawResponse>(`${API_BASE}/draw`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function wsUrl(): string {
  if (/^wss?:\/\//i.test(GRAFFITI_API_RAW_BASE)) return `${GRAFFITI_API_RAW_BASE.replace(/\/+$/, '')}/ws`

  if (/^https?:\/\//i.test(GRAFFITI_API_RAW_BASE)) {
    return `${GRAFFITI_API_RAW_BASE.replace(/^http/i, 'ws').replace(/\/+$/, '')}/ws`
  }

  // Relative path: build from window.location.
  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'

  return `${proto}://${window.location.host}${API_BASE}/ws`
}

async function errorFromResponse(res: Response): Promise<ApiError> {
  let reason = `HTTP ${res.status}`
  let retryable = res.status >= 500 || res.status === 409 || res.status === 429

  try {
    const body = (await res.json()) as { reason?: string; error?: string; retryable?: boolean }

    reason = body.reason || body.error || reason

    if (typeof body.retryable === 'boolean') retryable = body.retryable
  } catch {
    /* keep HTTP status as the reason */
  }

  return new ApiError(reason, res.status, retryable)
}

async function jsonFetch<T>(url: string, init?: RequestInit, timeoutMs = REQUEST_TIMEOUT_MS): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      ...init,
    })

    if (!res.ok) throw await errorFromResponse(res)

    return (await res.json()) as T
  } catch (err: unknown) {
    // An abort surfaces as "signal is aborted without reason", which says nothing about what
    // happened to the request. 408 so callers treat it as retryable.
    if (controller.signal.aborted) throw new ApiError(`timed out after ${timeoutMs / 1000}s`, 408, true)
    throw err
  } finally {
    clearTimeout(timer)
  }
}

const RECONNECT_BASE_MS = 1000
const RECONNECT_MAX_MS = 30_000

/**
 * Subscribe to live diffs. Returns a disposer. `onStatus` reports
 * 'connected' | 'reconnecting' so the UI can flip to the polling fallback;
 * `onReconnect` fires after a drop so the caller can resync missed cells —
 * diffs broadcast while the socket was down are gone.
 */
export function subscribeDiffs(
  onMessage: (msg: WsMessage) => void,
  onStatus: (status: 'connected' | 'reconnecting') => void,
  onReconnect?: () => void,
): () => void {
  let closedByUs = false
  let retryTimer: ReturnType<typeof setTimeout> | undefined
  let socket: WebSocket | undefined
  let attempt = 0
  let hadConnection = false

  const connect = (): void => {
    socket = new WebSocket(wsUrl())

    socket.onopen = () => {
      attempt = 0
      onStatus('connected')

      if (hadConnection) onReconnect?.()

      hadConnection = true
    }

    socket.onmessage = (event) => {
      try {
        onMessage(JSON.parse(event.data as string) as WsMessage)
      } catch {
        /* ignore malformed frames */
      }
    }

    socket.onclose = () => {
      if (closedByUs) return

      onStatus('reconnecting')

      // Exponential backoff with jitter: a flat retry makes every client
      // reconnect in lockstep and stampede the server after a restart.
      const backoff = Math.min(RECONNECT_BASE_MS * 2 ** attempt, RECONNECT_MAX_MS)

      attempt++
      retryTimer = setTimeout(connect, backoff * (0.5 + Math.random()))
    }

    socket.onerror = () => {
      socket?.close()
    }
  }

  connect()

  return () => {
    closedByUs = true

    if (retryTimer) clearTimeout(retryTimer)

    socket?.close()
  }
}
