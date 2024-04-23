import { atomWithStorage } from 'jotai/utils'
import { mapSupportedNetworks, SupportedChainId } from '@cowprotocol/cow-sdk'
import { atom } from 'jotai'
import { environmentAtom } from '../environmentAtom'
import { UnsupportedTokensState } from '../../types'
import { getJotaiMergerStorage } from '@cowprotocol/core'

export const unsupportedTokensAtom = atomWithStorage<Record<SupportedChainId, UnsupportedTokensState>>(
  'unsupportedTokensAtom:v2',
  mapSupportedNetworks({}),
  getJotaiMergerStorage()
)

export const currentUnsupportedTokensAtom = atom((get) => {
  const { chainId } = get(environmentAtom)

  return get(unsupportedTokensAtom)[chainId]
})

export const addUnsupportedTokenAtom = atom(null, (get, set, tokenAddress: string) => {
  const { chainId } = get(environmentAtom)
  const tokenId = tokenAddress.toLowerCase()
  const tokenList = get(unsupportedTokensAtom)

  if (!tokenList[chainId][tokenId]) {
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

  tokenAddresses.forEach((tokenAddress) => {
    const tokenId = tokenAddress.toLowerCase()

    delete tokenList[chainId][tokenId]
  })

  set(unsupportedTokensAtom, tokenList)
})
