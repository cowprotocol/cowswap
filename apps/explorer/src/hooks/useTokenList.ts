import { useMemo } from 'react'

import { SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
import { ALL_SUPPORTED_CHAIN_IDS, mapSupportedNetworks, SupportedChainId } from '@cowprotocol/cow-sdk'
import type { TokenInfo, TokenList } from '@uniswap/token-lists'

import useSWR from 'swr'

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
}

// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line complexity
export function useTokenList(chainId: SupportedChainId | undefined): { data: TokenListByAddress; isLoading: boolean } {
  const { data: cowSwapList, isLoading: isCowListLoading } = useTokenListByUrl(
    chainId !== SupportedChainId.SEPOLIA
      ? 'https://files.cow.fi/tokens/CowSwap.json'
      : 'https://raw.githubusercontent.com/cowprotocol/token-lists/main/src/public/CowSwapSepolia.json',
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
  const { data: baseList, isLoading: isBaseListLoading } = useTokenListByUrl(
    chainId === SupportedChainId.BASE ? 'https://tokens.coingecko.com/base/all.json' : '',
  )

  const isLoading = chainId
    ? isCowListLoading || isHoneyswapListLoading || isCoingeckoUniswapLoading || isCoingeckoLoading || isBaseListLoading
    : false

  return useMemo(() => {
    const data = chainId
      ? { ...coingeckoUniswapList, ...honeyswapList, ...cowSwapList, ...coingeckoList, ...baseList }[chainId]
      : {}

    return { data, isLoading }
  }, [chainId, coingeckoUniswapList, honeyswapList, cowSwapList, coingeckoList, isLoading, baseList])
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
      }, INITIAL_TOKEN_LIST_PER_NETWORK),
    )
}
