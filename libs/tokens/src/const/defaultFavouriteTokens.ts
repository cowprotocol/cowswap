import {
  COW,
  DAI,
  EURE_GNOSIS_CHAIN,
  GNO_GNOSIS_CHAIN,
  TokenWithLogo,
  USDC_GNOSIS_CHAIN,
  USDC_MAINNET,
  USDC_SEPOLIA,
  USDT,
  WBTC,
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

export const DEFAULT_FAVOURITE_TOKENS: Record<SupportedChainId, TokensMap> = {
  [SupportedChainId.MAINNET]: tokensListToMap([
    DAI,
    COW[SupportedChainId.MAINNET],
    USDC_MAINNET,
    USDT,
    WBTC,
    WRAPPED_NATIVE_CURRENCIES[SupportedChainId.MAINNET],
  ]),
  [SupportedChainId.GNOSIS_CHAIN]: tokensListToMap([
    USDC_GNOSIS_CHAIN,
    COW[SupportedChainId.GNOSIS_CHAIN],
    EURE_GNOSIS_CHAIN,
    WRAPPED_NATIVE_CURRENCIES[SupportedChainId.GNOSIS_CHAIN],
    GNO_GNOSIS_CHAIN,
    WETH_GNOSIS_CHAIN,
    WBTC_GNOSIS_CHAIN,
  ]),
  [SupportedChainId.SEPOLIA]: tokensListToMap([
    WRAPPED_NATIVE_CURRENCIES[SupportedChainId.SEPOLIA],
    COW[SupportedChainId.SEPOLIA],
    USDC_SEPOLIA,
  ]),
}
