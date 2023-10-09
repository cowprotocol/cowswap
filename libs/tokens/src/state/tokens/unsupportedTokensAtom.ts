import { atomWithStorage } from 'jotai/utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { atom } from 'jotai'
import { environmentAtom } from '../environmentAtom'

export const unsupportedTokensAtom = atomWithStorage<
  Record<SupportedChainId, { [tokenAddress: string]: { dateAdded: number } }>
>('unsupportedTokensAtom:v1', {
  [SupportedChainId.MAINNET]: {},
  [SupportedChainId.GNOSIS_CHAIN]: {},
  [SupportedChainId.GOERLI]: {},
})

export const currentUnsupportedTokensAtom = atom((get) => {
  const { chainId } = get(environmentAtom)

  return get(unsupportedTokensAtom)[chainId]
})

export const addUnsupportedTokenAtom = atom(null, (get, set, tokenAddress: string) => {
  const { chainId } = get(environmentAtom)
  const tokenId = tokenAddress.toLowerCase()
  const tokenList = get(unsupportedTokensAtom)

  if (!tokenList[chainId][tokenId]) {
    set(unsupportedTokensAtom, {
      ...tokenList,
      [chainId]: {
        ...tokenList[chainId],
        [tokenId]: Date.now(),
      },
    })
  }
})

export const removeUnsupportedTokenAtom = atom(null, (get, set, tokenAddress: string) => {
  const { chainId } = get(environmentAtom)
  const tokenId = tokenAddress.toLowerCase()
  const tokenList = { ...get(unsupportedTokensAtom) }

  if (tokenList[chainId][tokenId]) {
    delete tokenList[chainId][tokenId]

    set(unsupportedTokensAtom, tokenList)
  }
})
