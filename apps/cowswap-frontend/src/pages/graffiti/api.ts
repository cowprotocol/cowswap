// Graffiti wall backend client (SPEC: docs/graffiti/SPEC.md).
//
// REST base comes from REACT_APP_GRAFFITI_API (relative '/v1' by default, i.e.
// same-origin — the Vite dev proxy / a prod rewrite serves it). The WS URL is
// derived from it: relative → current host, absolute → its own host.

import type { Cell } from './raster'

const RAW_BASE = process.env.REACT_APP_GRAFFITI_API || '/v1'

/** REST base, no trailing slash. */
export const API_BASE = RAW_BASE.replace(/\/+$/, '')

export interface CanvasInfo {
  width: number
  height: number
  maxBoxWidth?: number
  maxBoxHeight?: number
  mint: string
  treasury: string
  network: string
  feePayerHint?: string
}

export interface CellsResponse {
  seq: number
  cells: Array<[number, number, number]> // [x, y, rgb]
}

export interface DrawResponse {
  ok: boolean
  seq: number
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

export type WsMessage =
  | { type: 'diff'; seq: number; cells: Array<[number, number, number]> }
  | { type: 'stats'; paintersOnline: number }

/** Derive the WebSocket endpoint from the REST base. */
export function wsUrl(): string {
  if (/^wss?:\/\//i.test(RAW_BASE)) return `${RAW_BASE.replace(/\/+$/, '')}/ws`

  if (/^https?:\/\//i.test(RAW_BASE)) {
    return `${RAW_BASE.replace(/^http/i, 'ws').replace(/\/+$/, '')}/ws`
  }

  // Relative path: build from window.location.
  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
  return `${proto}://${window.location.host}${API_BASE}/ws`
}

async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })

  if (!res.ok) {
    let reason = `HTTP ${res.status}`

    try {
      const body = (await res.json()) as { reason?: string; error?: string }
      reason = body.reason || body.error || reason
    } catch {
      /* keep HTTP status as the reason */
    }

    throw new Error(reason)
  }

  return res.json() as Promise<T>
}

export function getInfo(): Promise<CanvasInfo> {
  return jsonFetch<CanvasInfo>(`${API_BASE}/info`)
}

export function getCellsSince(seq: number): Promise<CellsResponse> {
  return jsonFetch<CellsResponse>(`${API_BASE}/cells?since=${seq}`)
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

/** Client-side error sink — surfaces paint-flow failures in the server log. */
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

export function getClaimInfo(code: string): Promise<ClaimInfoResponse> {
  return jsonFetch<ClaimInfoResponse>(`${API_BASE}/claim/${encodeURIComponent(code)}`)
}

export function postClaim(payload: { code: string; walletPubkey: string }): Promise<ClaimResponse> {
  return jsonFetch<ClaimResponse>(`${API_BASE}/claim`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/** Fetch the full canvas as raw RGB bytes via the PNG snapshot. */
export async function fetchCanvasPng(width: number, height: number): Promise<Uint8ClampedArray> {
  const res = await fetch(`${API_BASE}/canvas.png`)

  if (!res.ok) throw new Error(`canvas.png: HTTP ${res.status}`)

  const blob = await res.blob()
  const bitmap = await createImageBitmap(blob)
  const offscreen = document.createElement('canvas')

  offscreen.width = width
  offscreen.height = height

  const ctx = offscreen.getContext('2d')

  if (!ctx) throw new Error('no 2d context')

  ctx.drawImage(bitmap, 0, 0)

  const { data } = ctx.getImageData(0, 0, width, height)

  // PNG may carry an alpha channel; the wall is opaque RGB — force alpha to 255.
  for (let i = 3; i < data.length; i += 4) data[i] = 255

  return data
}

/**
 * Subscribe to live diffs. Returns a disposer. `onStatus` reports
 * 'connected' | 'reconnecting' so the UI can flip to the polling fallback.
 */
export function subscribeDiffs(
  onMessage: (msg: WsMessage) => void,
  onStatus: (status: 'connected' | 'reconnecting') => void,
): () => void {
  let closedByUs = false
  let retryTimer: ReturnType<typeof setTimeout> | undefined
  let socket: WebSocket | undefined

  const connect = () => {
    socket = new WebSocket(wsUrl())

    socket.onopen = () => onStatus('connected')

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
      retryTimer = setTimeout(connect, 3000)
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
