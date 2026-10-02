'use client'

import { useAtomValue } from 'jotai'
import { useEffect, useMemo, useState } from 'react'

import { getAddressKey } from '@cowprotocol/cow-sdk'

import { getBalancesWatcherTokens } from '../lib/balancesWatcherTokens'
import { getSupportedChainIds } from '../lib/tradeLeg'

import { type RwaToken, type RwaTokenList, tokenListQueryAtom } from '@/entities/asset'
import { type BalancesMap, type BalancesWatcherSubscription, watchBalances } from '@/shared/api'

const RESTART_DELAY_MS = 30_000

export interface AccountBalances {
  /** Non-zero balances only, `null` until every chain has sent its first snapshot or failed */
  positions: Position[] | null
  error: Error | null
}

export interface Position {
  token: RwaToken
  /** Atoms, decimal string */
  balance: string
}

interface ChainBalancesCallbacks {
  onBalances(balances: BalancesMap): void
  onError(error: Error): void
}

/** Streams the owner's balances of all the RWA tokens, and returns the ones of `tokens` */
export function useAccountBalances(owner: string | undefined, tokens: RwaToken[]): AccountBalances {
  const { data: tokenList, error: tokenListError } = useAtomValue(tokenListQueryAtom)
  const chainIds = useMemo(() => getSupportedChainIds(tokens), [tokens])
  const [balances, setBalances] = useState<Partial<Record<number, BalancesMap>>>({})
  const [errors, setErrors] = useState<Partial<Record<number, Error>>>({})

  useEffect(() => {
    setBalances({})
    setErrors({})

    if (!owner || !tokenList) return

    const stops = chainIds.map((chainId) =>
      watchChainBalances(chainId, owner, tokenList, {
        onBalances: (update) => {
          setBalances((current) => ({ ...current, [chainId]: { ...current[chainId], ...update } }))
          setErrors((current) => (current[chainId] ? withoutKey(current, chainId) : current))
        },
        onError: (error) => setErrors((current) => ({ ...current, [chainId]: error })),
      }),
    )

    return () => stops.forEach((stop) => stop())
  }, [owner, tokenList, chainIds])

  return useMemo((): AccountBalances => {
    const error = tokenListError ?? chainIds.map((chainId) => errors[chainId]).find(Boolean) ?? null
    const isLoaded = chainIds.every((chainId) => balances[chainId] || errors[chainId])

    if (!isLoaded) return { positions: null, error: tokenListError }

    const positions = tokens.flatMap((token) => {
      const balance = balances[token.chainId]?.[getAddressKey(token.address)]

      return balance && BigInt(balance) > 0n ? [{ token, balance }] : []
    })

    return { positions, error }
  }, [balances, chainIds, errors, tokenListError, tokens])
}

/** Restarts the session after a failure: the watcher only resumes from a fresh snapshot */
function watchChainBalances(
  chainId: number,
  owner: string,
  tokenList: RwaTokenList,
  callbacks: ChainBalancesCallbacks,
): () => void {
  let subscription: BalancesWatcherSubscription | null = null
  let restartTimer: ReturnType<typeof setTimeout> | undefined

  const start = (): void => {
    subscription = watchBalances({
      chainId,
      owner,
      tokens: getBalancesWatcherTokens(tokenList, chainId),
      onBalances: callbacks.onBalances,
      onError: (error) => {
        callbacks.onError(error)
        restartTimer = setTimeout(start, RESTART_DELAY_MS)
      },
    })
  }

  start()

  return () => {
    clearTimeout(restartTimer)
    subscription?.close()
  }
}

function withoutKey<T>(record: Partial<Record<number, T>>, key: number): Partial<Record<number, T>> {
  const next = { ...record }
  delete next[key]

  return next
}
