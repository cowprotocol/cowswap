import {
  ARB_ARBITRUM_ONE,
  COW,
  COW_TOKEN_ARBITRUM,
  DAI,
  DAI_ARBITRUM_ONE,
  EURE_GNOSIS_CHAIN,
  GNO_GNOSIS_CHAIN,
  TokenWithLogo,
  USDC_ARBITRUM_ONE,
  USDC_MAINNET,
  USDC_SEPOLIA,
  USDCe_GNOSIS_CHAIN,
  USDT,
  USDT_ARBITRUM_ONE,
  WBTC,
  WBTC_ARBITRUM_ONE,
  WBTC_GNOSIS_CHAIN,
  WETH_GNOSIS_CHAIN,
  WRAPPED_NATIVE_CURRENCIES,
} from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { TokensMap } from '../types'

const tokensListToMap = (list: TokenWithLogo[]) =>
  list.reduce<TokensMap>((acc, token) => {
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
    COW[SupportedChainId.MAINNET],
    USDC_MAINNET,
    USDT,
    WBTC,
    WRAPPED_NATIVE_CURRENCIES[SupportedChainId.MAINNET],
  ]),
  [SupportedChainId.GNOSIS_CHAIN]: tokensListToMap([
    USDCe_GNOSIS_CHAIN,
    COW[SupportedChainId.GNOSIS_CHAIN],
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
  [SupportedChainId.SEPOLIA]: tokensListToMap([
    WRAPPED_NATIVE_CURRENCIES[SupportedChainId.SEPOLIA],
    COW[SupportedChainId.SEPOLIA],
    USDC_SEPOLIA,
  ]),
}
