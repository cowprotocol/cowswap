import { getBalancesWatcherTokens } from '../lib/balancesWatcherTokens'

import type { RwaTokenList } from '@/entities/asset'

import { type BalancesMap, type BalancesWatcherSubscription, watchBalances } from '@/shared/api'

export const RESTART_DELAY_MS = 30_000
/** The session POST has no timeout and EventSource retries transport errors forever, so neither ever fails */
export const FIRST_SNAPSHOT_TIMEOUT_MS = 15_000

export interface ChainBalancesCallbacks {
  onBalances(balances: BalancesMap): void
  onError(error: Error): void
}

/** Restarts the session after a failure: the watcher only resumes from a fresh snapshot */
export function watchChainBalances(
  chainId: number,
  owner: string,
  tokenList: RwaTokenList,
  callbacks: ChainBalancesCallbacks,
): () => void {
  let subscription: BalancesWatcherSubscription | null = null
  let restartTimer: ReturnType<typeof setTimeout> | undefined
  let snapshotTimer: ReturnType<typeof setTimeout> | undefined

  const fail = (error: Error): void => {
    clearTimeout(snapshotTimer)
    subscription?.close()
    callbacks.onError(error)
    restartTimer = setTimeout(start, RESTART_DELAY_MS)
  }

  const start = (): void => {
    snapshotTimer = setTimeout(
      () => fail(new Error('Balances watcher did not send balances in time')),
      FIRST_SNAPSHOT_TIMEOUT_MS,
    )
    subscription = watchBalances({
      chainId,
      owner,
      tokens: getBalancesWatcherTokens(tokenList, chainId),
      onBalances: (balances) => {
        clearTimeout(snapshotTimer)
        callbacks.onBalances(balances)
      },
      onError: fail,
    })
  }

  start()

  return () => {
    clearTimeout(snapshotTimer)
    clearTimeout(restartTimer)
    subscription?.close()
  }
}
