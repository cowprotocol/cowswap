import { normalizeError } from '@cowprotocol/common-utils/errors'

import { FIRST_SNAPSHOT_TIMEOUT_MS } from './watchChainBalances'
import { withWatcherConnection } from './watcherConnections'

import { getBalancesWatcherTokens } from '../lib/balancesWatcherTokens'

import type { RwaTokenList } from '@/entities/asset'

import { type BalancesMap, type BalancesWatcherSubscription, readTokenBalances, watchBalances } from '@/shared/api'

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

/**
 * The first balances snapshot of a watcher session, or the balances read over RPC when the watcher fails: it doesn't
 * serve every chain (Robinhood) and refuses sessions above its token limit (1500, less than Arbitrum's tokens)
 */
export async function loadChainBalanceSnapshot(
  chainId: number,
  owner: string,
  tokenList: RwaTokenList,
  signal?: AbortSignal,
): Promise<BalancesMap> {
  try {
    return await withWatcherConnection(() => loadChainBalances(chainId, owner, tokenList, signal))
  } catch (err: unknown) {
    const error = normalizeError(err)

    if (signal?.aborted) throw error

    const addresses = tokenList.tokens.filter((token) => token.chainId === chainId).map((token) => token.address)

    return readTokenBalances(chainId, owner, addresses)
  }
}
