import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { UNISWAP_TOKENS_LIST } from '../../const/tokensLists'

const GITHUB_TOKEN_LIST_BASE = 'https://raw.githubusercontent.com/cowprotocol/token-lists/main/src/public'

export const UNISWAP_TOKEN_LIST_URL: Record<SupportedChainId, string> = {
  [SupportedChainId.MAINNET]: UNISWAP_TOKENS_LIST,
  [SupportedChainId.GNOSIS_CHAIN]: `${GITHUB_TOKEN_LIST_BASE}/Uniswap.100.json`,
  [SupportedChainId.ARBITRUM_ONE]: `${GITHUB_TOKEN_LIST_BASE}/Uniswap.42161.json`,
  [SupportedChainId.BASE]: `${GITHUB_TOKEN_LIST_BASE}/Uniswap.8453.json`,
  [SupportedChainId.SEPOLIA]: UNISWAP_TOKENS_LIST,
  [SupportedChainId.POLYGON]: `${GITHUB_TOKEN_LIST_BASE}/Uniswap.137.json`,
  [SupportedChainId.AVALANCHE]: `${GITHUB_TOKEN_LIST_BASE}/Uniswap.43114.json`,
  [SupportedChainId.LENS]: `${GITHUB_TOKEN_LIST_BASE}/CoinGecko.232.json`, // There's no Uniswap list for Lens, using Coingecko as a fallback
  [SupportedChainId.BNB]: `${GITHUB_TOKEN_LIST_BASE}/Uniswap.56.json`,
}
