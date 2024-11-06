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

type PoolsInfoState = Record<SupportedChainId, PoolInfoStates | undefined>

const poolsInfoAtom = atomWithStorage<PoolsInfoState>(
  'poolsInfoAtom:v1',
  mapSupportedNetworks({}),
  getJotaiIsolatedStorage(),
)

export const currentPoolsInfoAtom = atom((get) => {
  const { chainId } = get(walletInfoAtom)
  const poolsInfo = get(poolsInfoAtom)

  return poolsInfo[chainId]
})

export const upsertPoolsInfoAtom = atom(null, (get, set, update: Record<string, PoolInfo>) => {
  const { chainId } = get(walletInfoAtom)
  const poolsInfo = get(poolsInfoAtom)

  const currentState = poolsInfo[chainId]
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
      ...updatedState,
    },
  })
})
