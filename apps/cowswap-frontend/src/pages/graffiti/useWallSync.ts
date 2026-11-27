import { useCallback, useEffect, useState } from 'react'

import { type CanvasInfo, fetchCanvasPng, getAllCellsSince, getInfo, subscribeDiffs } from './graffiti.service'
import { CANVAS, setCanvasSize } from './raster.utils'

import type { WallPixels } from './useWallPixels'
import type { WallRefs } from './wall.types'

export interface WallSync {
  info: CanvasInfo | null
  loadError: string | null
  loaded: boolean
  seq: number
  wsStatus: WsStatus
  paintersOnline: number | null
  /** Record the latest applied sequence number. */
  markSeq: (seq: number) => void
}

type WsStatus = 'connected' | 'reconnecting'

const POLL_MS = 5000

export function useWallSync(refs: WallRefs, applyCells: WallPixels['applyCells']): WallSync {
  const [info, setInfo] = useState<CanvasInfo | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [seq, setSeq] = useState(0)
  const [wsStatus, setWsStatus] = useState<WsStatus>('reconnecting')
  const [paintersOnline, setPaintersOnline] = useState<number | null>(null)

  const { seqRef, pixelsRef, dirtyRef } = refs

  const markSeq = useCallback(
    (next: number): void => {
      seqRef.current = next
      setSeq(next)
    },
    [seqRef],
  )

  useEffect(() => {
    let disposed = false

    // Info is published as soon as it arrives, so a failed snapshot still leaves the mint known.
    loadInitialWall((loadedInfo) => {
      if (!disposed) setInfo(loadedInfo)
    })
      .then((pixels) => {
        if (disposed) return

        pixelsRef.current = pixels
        dirtyRef.current = true
        setLoaded(true)
      })
      .catch((err: unknown) => setLoadError(err instanceof Error ? err.message : String(err)))

    /** Pull every cell written since the last seq we applied. */
    const syncCells = (): Promise<void> =>
      getAllCellsSince(seqRef.current)
        .then((res) => {
          if (disposed) return

          markSeq(res.seq)
          applyCells(res.cells)
        })
        .catch(() => undefined)

    const unsubscribe = subscribeDiffs(
      (msg) => {
        if (msg.type === 'stats') return setPaintersOnline(msg.paintersOnline)

        markSeq(msg.seq)
        applyCells(msg.cells)
      },
      setWsStatus,
      // Diffs broadcast while the socket was down are gone: pull them back.
      () => void syncCells(),
    )

    // Polling fallback; also heals any diff missed between the snapshot and the socket.
    const pollTimer = setInterval(() => void syncCells(), POLL_MS)

    return () => {
      disposed = true
      unsubscribe()
      clearInterval(pollTimer)
    }
  }, [applyCells, dirtyRef, markSeq, pixelsRef, seqRef])

  return { info, loadError, loaded, seq, wsStatus, paintersOnline, markSeq }
}

/**
 * Wall geometry first, then the snapshot sized to it: fetching both at once
 * would rasterize the PNG at the default size when the server is configured
 * differently. Info failing is non-fatal; the mint is only needed to paint.
 */
async function loadInitialWall(onInfo: (info: CanvasInfo | null) => void): Promise<Uint8ClampedArray> {
  const info = await getInfo().catch(() => null)

  if (info?.width && info?.height) setCanvasSize(info.width, info.height)

  onInfo(info)

  return fetchCanvasPng(CANVAS.w, CANVAS.h)
}
