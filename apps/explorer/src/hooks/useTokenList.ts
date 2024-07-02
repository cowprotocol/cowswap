import { useMemo } from 'react'

import { SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
import { ALL_SUPPORTED_CHAIN_IDS, SupportedChainId, mapSupportedNetworks } from '@cowprotocol/cow-sdk'
import type { TokenInfo, TokenList } from '@uniswap/token-lists'

import useSWR from 'swr'

type TokenListByAddress = Record<string, TokenInfo>
type TokenListPerNetwork = Record<SupportedChainId, TokenListByAddress>

const INITIAL_TOKEN_LIST_PER_NETWORK: TokenListPerNetwork = mapSupportedNetworks({})

export function useTokenList(chainId: SupportedChainId | undefined): { data: TokenListByAddress; isLoading: boolean } {
  const { data: cowSwapList, isLoading: isCowListLoading } = useTokenListByUrl(
    chainId !== SupportedChainId.SEPOLIA
      ? 'https://files.cow.fi/tokens/CowSwap.json'
      : 'https://raw.githubusercontent.com/cowprotocol/token-lists/main/src/public/CowSwapSepolia.json'
  )
  const { data: coingeckoList, isLoading: isCoingeckoListLoading } = useTokenListByUrl(
    chainId === SupportedChainId.MAINNET ? 'https://tokens.coingecko.com/uniswap/all.json' : ''
  )
  const { data: honeyswapList, isLoading: isHoneyswapListLoading } = useTokenListByUrl(
    chainId === SupportedChainId.GNOSIS_CHAIN ? 'https://tokens.honeyswap.org' : ''
  )
  const { data: arbitrumOneList, isLoading: isArbitrumOneListLoading } = useTokenListByUrl(
    chainId === SupportedChainId.ARBITRUM_ONE ? 'https://tokens.coingecko.com/arbitrum-one/all.json' : ''
  )

  const isLoading = chainId
    ? isCowListLoading || isHoneyswapListLoading || isCoingeckoListLoading || isArbitrumOneListLoading
    : false

  return useMemo(() => {
    const data = chainId ? { ...coingeckoList, ...honeyswapList, ...cowSwapList, ...arbitrumOneList }[chainId] : {}

    return { data, isLoading }
  }, [chainId, coingeckoList, honeyswapList, cowSwapList, arbitrumOneList, isLoading])
}

function useTokenListByUrl(tokenListUrl: string) {
  return useSWR(tokenListUrl, fetcher, {
    fallbackData: INITIAL_TOKEN_LIST_PER_NETWORK,
    ...SWR_NO_REFRESH_OPTIONS,
  })
}

const SUPPORTED_CHAIN_IDS_SET = new Set(ALL_SUPPORTED_CHAIN_IDS)

function fetcher(tokenListUrl: string): Promise<TokenListPerNetwork> {
  return fetch(tokenListUrl)
    .then<TokenList>((res) => res.json())
    .then(({ tokens }) =>
      // Create an object with token addresses as keys
      tokens.reduce((acc, token) => {
        // Pick only supported chains
        if (SUPPORTED_CHAIN_IDS_SET.has(token.chainId)) {
          acc[token.chainId][token.address.toLowerCase()] = token
        }
        return acc
      }, INITIAL_TOKEN_LIST_PER_NETWORK)
    )
}
