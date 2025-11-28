import { useMemo } from 'react'

import { SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
import { ALL_SUPPORTED_CHAIN_IDS, mapSupportedNetworks, SupportedChainId } from '@cowprotocol/cow-sdk'
import type { TokenInfo, TokenList } from '@uniswap/token-lists'

import useSWR, { SWRResponse } from 'swr'

import { NATIVE_TOKEN_ADDRESS, NATIVE_TOKEN_PER_NETWORK } from '../const'

type TokenListByAddress = Record<string, TokenInfo>
type TokenListPerNetwork = Record<SupportedChainId, TokenListByAddress>

const INITIAL_TOKEN_LIST_PER_NETWORK: TokenListPerNetwork = mapSupportedNetworks({})

const COINGECKO_CHAINS: Record<SupportedChainId, string | null> = {
  [SupportedChainId.MAINNET]: 'ethereum',
  [SupportedChainId.GNOSIS_CHAIN]: 'xdai',
  [SupportedChainId.BASE]: 'base',
  [SupportedChainId.ARBITRUM_ONE]: 'arbitrum-one',
  [SupportedChainId.SEPOLIA]: null,
  [SupportedChainId.POLYGON]: 'polygon-pos',
  [SupportedChainId.AVALANCHE]: 'avalanche',
  [SupportedChainId.LENS]: 'lens',
  [SupportedChainId.BNB]: 'binance-smart-chain',
  [SupportedChainId.LINEA]: 'linea',
  [SupportedChainId.PLASMA]: 'plasma',
}

const EMPTY_TOKENS: TokenListByAddress = {}

export function useTokenList(chainId: SupportedChainId | undefined): { data: TokenListByAddress; isLoading: boolean } {
  const { data: cowSwapList, isLoading: isCowListLoading } = useTokenListByUrl(
    chainId !== SupportedChainId.SEPOLIA
      ? 'https://files.cow.fi/tokens/CowSwap.json'
      : 'https://files.cow.fi/token-lists/CowSwapSepolia.json',
  )
  const { data: coingeckoUniswapList, isLoading: isCoingeckoUniswapLoading } = useTokenListByUrl(
    chainId === SupportedChainId.MAINNET ? 'https://tokens.coingecko.com/uniswap/all.json' : '',
  )
  const { data: honeyswapList, isLoading: isHoneyswapListLoading } = useTokenListByUrl(
    chainId === SupportedChainId.GNOSIS_CHAIN ? 'https://tokens.honeyswap.org' : '',
  )
  const coingeckoUrlKey = chainId && COINGECKO_CHAINS[chainId]
  const { data: coingeckoList, isLoading: isCoingeckoLoading } = useTokenListByUrl(
    coingeckoUrlKey ? `https://tokens.coingecko.com/${coingeckoUrlKey}/all.json` : '',
  )

  const isLoading = chainId
    ? isCowListLoading || isHoneyswapListLoading || isCoingeckoUniswapLoading || isCoingeckoLoading
    : false

  return useMemo(() => {
    if (!chainId) return { data: EMPTY_TOKENS, isLoading: false }

    // Merge lists in priority order, defaulting undefined entries to INITIAL_TOKEN_LIST_PER_NETWORK
    const mergedByChain = [coingeckoUniswapList, honeyswapList, cowSwapList, coingeckoList].reduce<TokenListPerNetwork>(
      (acc, src) => ({ ...acc, ...(src ?? INITIAL_TOKEN_LIST_PER_NETWORK) }),
      INITIAL_TOKEN_LIST_PER_NETWORK,
    )

    const data = {
      ...(mergedByChain[chainId] || EMPTY_TOKENS),
    }

    const nativeToken = NATIVE_TOKEN_PER_NETWORK[chainId]

    data[NATIVE_TOKEN_ADDRESS.toLowerCase()] = {
      ...nativeToken,
      name: nativeToken.name || '',
      symbol: nativeToken.symbol || '',
      chainId,
    }

    return { data, isLoading }
  }, [chainId, coingeckoUniswapList, honeyswapList, cowSwapList, coingeckoList, isLoading])
}

function useTokenListByUrl(tokenListUrl: string): SWRResponse<TokenListPerNetwork> {
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
      }, INITIAL_TOKEN_LIST_PER_NETWORK),
    )
}
