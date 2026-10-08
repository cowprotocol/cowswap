'use client'

import { useAtomValue } from 'jotai'
import { useEffect, useMemo, useState } from 'react'

import { getAddressKey } from '@cowprotocol/cow-sdk'

import { watchChainBalances } from './watchChainBalances'

import { getSupportedChainIds } from '../lib/tradeLeg'

import type { BalancesMap } from '@/shared/api'

import { type RwaToken, tokenListQueryAtom } from '@/entities/asset'

export interface AccountBalances {
  /** Non-zero balances only, `null` until every chain has sent its first snapshot or failed */
  positions: Position[] | null
  error: Error | null
  /** Chains whose balances are missing from `positions` */
  failedChainIds: number[]
}

export interface Position {
  token: RwaToken
  /** Atoms, decimal string */
  balance: string
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

    const failedChainIds = chainIds.filter((chainId) => errors[chainId])

    if (!isLoaded) return { positions: null, error: tokenListError, failedChainIds }

    const positions = tokens.flatMap((token) => {
      const balance = balances[token.chainId]?.[getAddressKey(token.address)]

      return balance && BigInt(balance) > 0n ? [{ token, balance }] : []
    })

    return { positions, error, failedChainIds }
  }, [balances, chainIds, errors, tokenListError, tokens])
}

function withoutKey<T>(record: Partial<Record<number, T>>, key: number): Partial<Record<number, T>> {
  const next = { ...record }
  delete next[key]

  return next
}
