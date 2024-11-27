import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { getJotaiMergerStorage } from '@cowprotocol/core'
import { mapSupportedNetworks, SupportedChainId } from '@cowprotocol/cow-sdk'
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

export const addUnsupportedTokenAtom = atom(null, (get, set, chainId: SupportedChainId, tokenAddress: string) => {
  const tokenId = tokenAddress.toLowerCase()
  const tokenList = get(unsupportedTokensAtom)
  const tokenListForChain = tokenList[chainId] || {}

  if (!tokenListForChain[tokenId]) {
    const update: UnsupportedTokensState = {
      ...tokenList[chainId],
      [tokenId]: { dateAdded: Date.now() },
    }

    set(unsupportedTokensAtom, {
      ...tokenList,
      [chainId]: update,
    })
  }
})

export const removeUnsupportedTokensAtom = atom(null, (get, set, tokenAddresses: Array<string>) => {
  const { chainId } = get(environmentAtom)
  const tokenList = { ...get(unsupportedTokensAtom) }
  const tokenListForChain = tokenList[chainId] || {}

  tokenAddresses.forEach((tokenAddress) => {
    const tokenId = tokenAddress.toLowerCase()

    delete tokenListForChain[tokenId]
  })

  set(unsupportedTokensAtom, tokenList)
})
