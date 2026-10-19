import { FIRST_SNAPSHOT_TIMEOUT_MS } from './watchChainBalances'

import { getBalancesWatcherTokens } from '../lib/balancesWatcherTokens'

import type { RwaTokenList } from '@/entities/asset'

import { type BalancesMap, type BalancesWatcherSubscription, watchBalances } from '@/shared/api'

/** The first balances snapshot of a watcher session; the stream is closed as soon as it settles */
export function loadChainBalances(
  chainId: number,
  owner: string,
  tokenList: RwaTokenList,
  signal?: AbortSignal,
): Promise<BalancesMap> {
  if (signal?.aborted) return Promise.reject(new Error('Balances request aborted'))

  return new Promise((resolve, reject) => {
    let subscription: BalancesWatcherSubscription | null = null

    const settle = (complete: () => void): void => {
      clearTimeout(timer)
      signal?.removeEventListener('abort', abort)
      subscription?.close()
      complete()
    }
    const abort = (): void => settle(() => reject(new Error('Balances request aborted')))
    const timer = setTimeout(
      () => settle(() => reject(new Error('Balances watcher did not send balances in time'))),
      FIRST_SNAPSHOT_TIMEOUT_MS,
    )

    signal?.addEventListener('abort', abort)
    subscription = watchBalances({
      chainId,
      owner,
      tokens: getBalancesWatcherTokens(tokenList, chainId),
      onBalances: (balances) => settle(() => resolve(balances)),
      onError: (error) => settle(() => reject(error)),
    })
  })
}
