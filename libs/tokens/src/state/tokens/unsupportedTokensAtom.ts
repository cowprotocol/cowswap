import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { getJotaiMergerStorage } from '@cowprotocol/core'
import { getAddressKey, mapSupportedNetworks, SupportedChainId } from '@cowprotocol/cow-sdk'
import { PersistentStateByChain } from '@cowprotocol/types'

import { UnsupportedTokensState } from '../../types'
import { environmentAtom } from '../environmentAtom'

export const unsupportedTokensAtom = atomWithStorage<PersistentStateByChain<UnsupportedTokensState>>(
  'unsupportedTokensAtom:v2',
  mapSupportedNetworks({}),
  getJotaiMergerStorage(),
)

export const currentUnsupportedTokensAtom = atom((get) => {
  const { chainId } = get(environmentAtom)

  return get(unsupportedTokensAtom)[chainId]
})

export const addUnsupportedTokenAtom = atom(
  null,
  (get, set, chainId: SupportedChainId, tokenAddress: string, reason?: string) => {
    const tokenId = getAddressKey(tokenAddress)
    const tokenList = get(unsupportedTokensAtom)
    const existing = tokenList[chainId]?.[tokenId]

    if (existing && existing.reason === reason) return

    const update: UnsupportedTokensState = {
      ...tokenList[chainId],
      [tokenId]: { dateAdded: existing?.dateAdded ?? Date.now(), ...(reason ? { reason } : undefined) },
    }

    set(unsupportedTokensAtom, {
      ...tokenList,
      [chainId]: update,
    })
  },
)

export const removeUnsupportedTokensAtom = atom(null, (get, set, tokenAddresses: Array<string>) => {
  const { chainId } = get(environmentAtom)
  const tokenList = { ...get(unsupportedTokensAtom) }
  const tokenListForChain = tokenList[chainId] || {}

  tokenAddresses.forEach((tokenAddress) => {
    const tokenId = getAddressKey(tokenAddress)

    delete tokenListForChain[tokenId]
  })

  set(unsupportedTokensAtom, tokenList)
})
