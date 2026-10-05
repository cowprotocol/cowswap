import { getAddressKey } from '@cowprotocol/cow-sdk'

import type { RwaTokenSummary } from '@/entities/asset'
import type { BalancesMap } from '@/shared/api'

/** The fields of a chain balances query result that `combineChainBalances` reads */
export interface ChainBalancesResult {
  data: BalancesMap | undefined
  error: Error | null
  isFetching: boolean
  /** ms, `0` without data */
  dataUpdatedAt: number
}

export interface ChainBalancesSnapshot<T extends RwaTokenSummary = RwaTokenSummary> {
  /** Non-zero balances only, `null` until every chain has loaded or failed once */
  positions: Position<T>[] | null
  error: Error | null
  /** Chains whose balances are missing or outdated in `positions` */
  failedChainIds: number[]
  /** Chains whose current load has finished, successfully or not */
  loadedChains: number
  totalChains: number
  isFetching: boolean
  /** ms, the oldest snapshot of the chains with data, `null` without any */
  updatedAt: number | null
}

export interface Position<T extends RwaTokenSummary = RwaTokenSummary> {
  token: T
  /** Atoms, decimal string */
  balance: string
}

/** `results[i]` is the query result of `chainIds[i]` */
export function combineChainBalances<T extends RwaTokenSummary>(
  tokens: T[],
  chainIds: number[],
  results: ChainBalancesResult[],
): ChainBalancesSnapshot<T> {
  const settled = results.filter(({ data, error }) => data !== undefined || error !== null)
  const finished = settled.filter(({ isFetching }) => !isFetching)
  const failedChainIds = chainIds.filter((_, index) => results[index]?.error)
  const balances = Object.fromEntries(chainIds.map((chainId, index) => [chainId, results[index]?.data]))
  const updatedAts = results.flatMap(({ data, dataUpdatedAt }) => (data === undefined ? [] : [dataUpdatedAt]))

  return {
    positions: settled.length === chainIds.length ? toPositions(tokens, balances) : null,
    error: results.find(({ error }) => error)?.error ?? null,
    failedChainIds,
    loadedChains: finished.length,
    totalChains: chainIds.length,
    isFetching: results.some(({ isFetching }) => isFetching),
    updatedAt: updatedAts.length ? Math.min(...updatedAts) : null,
  }
}

/** Non-zero balances of `tokens` in `balances`, keyed by chain id */
export function toPositions<T extends RwaTokenSummary>(
  tokens: T[],
  balances: Partial<Record<number, BalancesMap>>,
): Position<T>[] {
  return tokens.flatMap((token) => {
    const balance = balances[token.chainId]?.[getAddressKey(token.address)]

    return balance && BigInt(balance) > 0n ? [{ token, balance }] : []
  })
}
