import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { getJotaiIsolatedStorage } from '@cowprotocol/core'
import { SupportedChainId, mapSupportedNetworks } from '@cowprotocol/cow-sdk'
import { walletInfoAtom } from '@cowprotocol/wallet'

export interface PoolInfo {
  apy: number
  tvl: number
  feeTier: number
  volume24h: number
}

type PoolInfoState = {
  info: PoolInfo
  updatedAt: number
}

export type PoolInfoStates = Record<string, PoolInfoState>

type PoolInfoStatesPerAccount = Record<string, PoolInfoStates>

type PoolsInfoState = Record<SupportedChainId, PoolInfoStatesPerAccount | undefined>

const poolsInfoAtom = atomWithStorage<PoolsInfoState>(
  'poolsInfoAtom:v0',
  mapSupportedNetworks({}),
  getJotaiIsolatedStorage(),
)

export const currentPoolsInfoAtom = atom((get) => {
  const { chainId, account } = get(walletInfoAtom)
  const poolsInfo = get(poolsInfoAtom)

  return account ? poolsInfo[chainId]?.[account] : undefined
})

export const upsertPoolsInfoAtom = atom(null, (get, set, update: Record<string, PoolInfo>) => {
  const { chainId, account } = get(walletInfoAtom)
  const poolsInfo = get(poolsInfoAtom)

  if (!account) return

  const currentState = poolsInfo[chainId]?.[account]
  const updatedState = {
    ...currentState,
    ...Object.keys(update).reduce((acc, address) => {
      acc[address] = {
        info: update[address],
        updatedAt: Date.now(),
      }

      return acc
    }, {} as PoolInfoStates),
  }

  set(poolsInfoAtom, {
    ...poolsInfo,
    [chainId]: {
      ...poolsInfo[chainId],
      [account]: updatedState,
    },
  })
})
