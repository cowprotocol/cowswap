import { useMemo } from 'react'

import { COW_CDN, SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
import { ALL_SUPPORTED_CHAIN_IDS, getAddressKey, mapSupportedNetworks, SupportedChainId } from '@cowprotocol/cow-sdk'

import useSWR, { SWRResponse } from 'swr'

import { NATIVE_TOKEN_PER_NETWORK } from '../const'

import type { TokenInfo, TokenList } from '@uniswap/token-lists'

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
  [SupportedChainId.BNB]: 'binance-smart-chain',
  [SupportedChainId.LINEA]: 'linea',
  [SupportedChainId.PLASMA]: 'plasma',
  [SupportedChainId.INK]: 'ink',
  [SupportedChainId.SOLANA]: null,
}

/** The same list the swap app loads for Solana, see `libs/tokens/src/const/tokensList.json`. */
const SOLANA_TOKEN_LIST_URL = `${COW_CDN}/token-lists/SolanaDefault.json`

const EMPTY_TOKENS: TokenListByAddress = {}

export function useTokenList(chainId: SupportedChainId | undefined): { data: TokenListByAddress; isLoading: boolean } {
  const { data: cowSwapList, isLoading: isCowListLoading } = useTokenListByUrl(
    chainId !== SupportedChainId.SEPOLIA
      ? `${COW_CDN}/tokens/CowSwap.json`
      : `${COW_CDN}/token-lists/CowSwapSepolia.json`,
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
  // The only source of SPL metadata here. Coingecko has no Solana feed in `COINGECKO_CHAINS`, and a
  // mint is not a contract to read `symbol`/`decimals` off, so a token missing from this list stays
  // unknown — and without decimals an order's amounts cannot be rendered at all.
  const { data: solanaList, isLoading: isSolanaListLoading } = useTokenListByUrl(
    chainId === SupportedChainId.SOLANA ? SOLANA_TOKEN_LIST_URL : '',
  )

  const isLoading =
    Boolean(chainId) &&
    [isCowListLoading, isHoneyswapListLoading, isCoingeckoUniswapLoading, isCoingeckoLoading, isSolanaListLoading].some(
      Boolean,
    )

  return useMemo(() => {
    if (!chainId) return { data: EMPTY_TOKENS, isLoading: false }

    // Merge lists in priority order, defaulting undefined entries to INITIAL_TOKEN_LIST_PER_NETWORK
    const mergedByChain = [
      coingeckoUniswapList,
      honeyswapList,
      cowSwapList,
      coingeckoList,
      solanaList,
    ].reduce<TokenListPerNetwork>(
      (acc, src) => ({ ...acc, ...(src ?? INITIAL_TOKEN_LIST_PER_NETWORK) }),
      INITIAL_TOKEN_LIST_PER_NETWORK,
    )

    const data = {
      ...(mergedByChain[chainId] || EMPTY_TOKENS),
    }

    const nativeToken = NATIVE_TOKEN_PER_NETWORK[chainId]

    data[getAddressKey(nativeToken.address)] = {
      ...nativeToken,
      name: nativeToken.name || '',
      symbol: nativeToken.symbol || '',
      chainId,
    }

    return { data, isLoading }
  }, [chainId, coingeckoUniswapList, honeyswapList, cowSwapList, coingeckoList, solanaList, isLoading])
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
          acc[token.chainId][getAddressKey(token.address)] = token
        }
        return acc
      }, INITIAL_TOKEN_LIST_PER_NETWORK),
    )
}
