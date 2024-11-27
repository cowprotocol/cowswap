import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { SupportedChainId, mapSupportedNetworks } from '@cowprotocol/cow-sdk'
import { PersistentStateByChain } from '@cowprotocol/types'

import { TokenErc20 } from '@gnosis.pm/dex-js'

export type TokensLoadedFromChain = PersistentStateByChain<Record<string, TokenErc20>>

const DEFAULT_TOKENS_LOADED_FROM_CHAIN: TokensLoadedFromChain = mapSupportedNetworks({})

export const tokensLoadedFromChainAtom = atomWithStorage<TokensLoadedFromChain>(
  'tokensLoadedFromChain:v0',
  DEFAULT_TOKENS_LOADED_FROM_CHAIN,
)

type AddLoadedTokens = {
  chainId: SupportedChainId
  tokens: TokenErc20[]
}

export const addLoadedTokensToChainAtom = atom(null, (get, set, { chainId, tokens }: AddLoadedTokens) => {
  const current = get(tokensLoadedFromChainAtom)

  const chainTokens = current[chainId]

  const updatedChainTokens = tokens.reduce(
    (acc, token) => {
      const address = token.address.toLowerCase()
      if (!acc[address]) {
        acc[address] = token
      }
      return acc
    },
    { ...chainTokens },
  )

  set(tokensLoadedFromChainAtom, { ...current, [chainId]: updatedChainTokens })
})
