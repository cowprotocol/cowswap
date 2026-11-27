import { limitConcurrency } from '../lib/limitConcurrency'

interface WatchedChains {
  /** Watched live, each stream keeps a connection while it is open */
  streamed: number[]
  /** Loaded once each, through the connection left free */
  snapshot: number[]
}

// Browsers open at most 6 HTTP/1.1 connections per host and each SSE stream holds one until it closes
export const MAX_BALANCES_WATCHER_CONNECTIONS = 6

/** Every balances watcher request runs through this pool, so they never queue in the browser and time out */
export const withWatcherConnection = limitConcurrency(MAX_BALANCES_WATCHER_CONNECTIONS)

/** Runs `start` once a connection is free and keeps it until the returned stop function is called */
export function holdWatcherConnection(start: () => () => void): () => void {
  let stopStream: (() => void) | null = null
  let release: (() => void) | null = null
  let isStopped = false

  void withWatcherConnection(
    () =>
      new Promise<void>((resolve) => {
        if (isStopped) {
          resolve()
          return
        }

        release = resolve
        stopStream = start()
      }),
  )

  return () => {
    isStopped = true
    stopStream?.()
    release?.()
  }
}

export function splitWatchedChains(chainIds: number[]): WatchedChains {
  if (chainIds.length <= MAX_BALANCES_WATCHER_CONNECTIONS) return { streamed: chainIds, snapshot: [] }

  const streamedCount = MAX_BALANCES_WATCHER_CONNECTIONS - 1

  return { streamed: chainIds.slice(0, streamedCount), snapshot: chainIds.slice(streamedCount) }
}
