import { atomWithStorage } from 'jotai/utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { atom } from 'jotai'
import { tokensListsEnvironmentAtom } from './tokensListsEnvironmentAtom'

export const unsupportedTokensAtom = atomWithStorage<
  Record<SupportedChainId, { [tokenAddress: string]: { dateAdded: number } }>
>('unsupportedTokensAtom:v1', {
  [SupportedChainId.MAINNET]: {},
  [SupportedChainId.GNOSIS_CHAIN]: {},
  [SupportedChainId.GOERLI]: {},
})

export const currentUnsupportedTokensAtom = atom((get) => {
  const { chainId } = get(tokensListsEnvironmentAtom)

  return get(unsupportedTokensAtom)[chainId]
})

export const addUnsupportedTokenAtom = atom(null, (get, set, tokenAddress: string) => {
  const { chainId } = get(tokensListsEnvironmentAtom)
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
  const { chainId } = get(tokensListsEnvironmentAtom)
  const tokenId = tokenAddress.toLowerCase()
  const tokenList = { ...get(unsupportedTokensAtom) }

  if (tokenList[chainId][tokenId]) {
    delete tokenList[chainId][tokenId]

    set(unsupportedTokensAtom, tokenList)
  }
})
