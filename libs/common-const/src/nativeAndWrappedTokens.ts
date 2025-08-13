import {
  ALL_SUPPORTED_CHAINS_MAP,
  mapSupportedNetworks,
  SupportedChainId,
  WRAPPED_NATIVE_CURRENCIES as WRAPPED_NATIVE_CURRENCIES_SDK,
} from '@cowprotocol/cow-sdk'

import { TokenWithLogo } from './types'

export const NATIVE_CURRENCY_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'

export const WRAPPED_NATIVE_CURRENCIES: Record<SupportedChainId, TokenWithLogo> = mapSupportedNetworks(
  getTokenWithLogoFromWrappedNativeCurrency,
)

export const NATIVE_CURRENCIES: Record<SupportedChainId, TokenWithLogo> = mapSupportedNetworks(
  getTokenWithLogoFromNativeCurrency,
)

export const WETH_MAINNET = WRAPPED_NATIVE_CURRENCIES[SupportedChainId.MAINNET]
export const WXDAI = WRAPPED_NATIVE_CURRENCIES[SupportedChainId.GNOSIS_CHAIN]
export const WETH_SEPOLIA = WRAPPED_NATIVE_CURRENCIES[SupportedChainId.SEPOLIA]

function getTokenWithLogoFromWrappedNativeCurrency(chainId: SupportedChainId): TokenWithLogo {
  const wrapped = WRAPPED_NATIVE_CURRENCIES_SDK[chainId]

  return new TokenWithLogo(wrapped.logoUrl, chainId, wrapped.address, wrapped.decimals, wrapped.symbol, wrapped.name)
}

function getTokenWithLogoFromNativeCurrency(chainId: SupportedChainId): TokenWithLogo {
  const nativeCurrency = ALL_SUPPORTED_CHAINS_MAP[chainId].nativeCurrency

  return new TokenWithLogo(
    undefined,
    chainId,
    nativeCurrency.address,
    nativeCurrency.decimals,
    nativeCurrency.symbol,
    nativeCurrency.name,
  )
}
