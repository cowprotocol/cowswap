import {
  ARB_ARBITRUM_ONE,
  CBBTC_BASE,
  COW_TOKEN_ARBITRUM,
  COW_TOKEN_BASE,
  COW_TOKEN_MAINNET,
  COW_TOKEN_POLYGON,
  COW_TOKEN_SEPOLIA,
  COW_TOKEN_XDAI,
  DAI,
  DAI_ARBITRUM_ONE,
  DAI_BASE,
  DAI_POLYGON,
  EURE_GNOSIS_CHAIN,
  GNO_GNOSIS_CHAIN,
  TokenWithLogo,
  USDC_ARBITRUM_ONE,
  USDC_AVALANCHE,
  USDC_BASE,
  USDC_MAINNET,
  USDC_POLYGON,
  USDC_SEPOLIA,
  USDCe_GNOSIS_CHAIN,
  USDT,
  USDT_ARBITRUM_ONE,
  USDT_AVALANCHE,
  USDT_BASE,
  USDT_POLYGON,
  WBTC,
  WBTC_ARBITRUM_ONE,
  WBTC_GNOSIS_CHAIN,
  WETH_GNOSIS_CHAIN,
  WRAPPED_NATIVE_CURRENCIES,
} from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { TokensMap } from '../types'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const tokensListToMap = (list: (TokenWithLogo | null)[]) =>
  list.reduce<TokensMap>((acc, token) => {
    if (!token) {
      return acc
    }
    acc[token.address.toLowerCase()] = {
      chainId: token.chainId,
      address: token.address,
      name: token.name || '',
      decimals: token.decimals,
      symbol: token.symbol || '',
      logoURI: token.logoURI,
    }
    return acc
  }, {})

export const DEFAULT_FAVORITE_TOKENS: Record<SupportedChainId, TokensMap> = {
  [SupportedChainId.MAINNET]: tokensListToMap([
    DAI,
    COW_TOKEN_MAINNET,
    USDC_MAINNET,
    USDT,
    WBTC,
    WRAPPED_NATIVE_CURRENCIES[SupportedChainId.MAINNET],
  ]),
  [SupportedChainId.GNOSIS_CHAIN]: tokensListToMap([
    USDCe_GNOSIS_CHAIN,
    COW_TOKEN_XDAI,
    EURE_GNOSIS_CHAIN,
    WRAPPED_NATIVE_CURRENCIES[SupportedChainId.GNOSIS_CHAIN],
    GNO_GNOSIS_CHAIN,
    WETH_GNOSIS_CHAIN,
    WBTC_GNOSIS_CHAIN,
  ]),
  [SupportedChainId.ARBITRUM_ONE]: tokensListToMap([
    USDC_ARBITRUM_ONE,
    USDT_ARBITRUM_ONE,
    WRAPPED_NATIVE_CURRENCIES[SupportedChainId.ARBITRUM_ONE],
    WBTC_ARBITRUM_ONE,
    DAI_ARBITRUM_ONE,
    ARB_ARBITRUM_ONE,
    COW_TOKEN_ARBITRUM,
  ]),
  [SupportedChainId.BASE]: tokensListToMap([
    USDC_BASE,
    USDT_BASE,
    WRAPPED_NATIVE_CURRENCIES[SupportedChainId.BASE],
    CBBTC_BASE,
    DAI_BASE,
    COW_TOKEN_BASE,
  ]),
  [SupportedChainId.SEPOLIA]: tokensListToMap([
    WRAPPED_NATIVE_CURRENCIES[SupportedChainId.SEPOLIA],
    COW_TOKEN_SEPOLIA,
    USDC_SEPOLIA,
  ]),
  [SupportedChainId.POLYGON]: tokensListToMap([
    USDC_POLYGON,
    USDT_POLYGON,
    DAI_POLYGON,
    COW_TOKEN_POLYGON,
    WRAPPED_NATIVE_CURRENCIES[SupportedChainId.POLYGON],
  ]),
  [SupportedChainId.AVALANCHE]: tokensListToMap([
    USDC_AVALANCHE,
    USDT_AVALANCHE,
    WRAPPED_NATIVE_CURRENCIES[SupportedChainId.AVALANCHE],
  ]),
}
