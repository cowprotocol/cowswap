import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { cowprotocolTokenLogoUrl } from './cowprotocolTokenLogoUrl'
import { TokenWithLogo } from './types'

export const NATIVE_CURRENCY_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'

const DEFAULT_NATIVE_DECIMALS = 18
const WETH9_MAINNET_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
const ETH_LOGO_URL = cowprotocolTokenLogoUrl(WETH9_MAINNET_ADDRESS.toLowerCase(), SupportedChainId.MAINNET)

export const WRAPPED_NATIVE_CURRENCIES: Record<SupportedChainId, TokenWithLogo> = {
  [SupportedChainId.MAINNET]: new TokenWithLogo(
    ETH_LOGO_URL,
    SupportedChainId.MAINNET,
    WETH9_MAINNET_ADDRESS,
    DEFAULT_NATIVE_DECIMALS,
    'WETH',
    'Wrapped Ether'
  ),
  [SupportedChainId.GNOSIS_CHAIN]: new TokenWithLogo(
    undefined,
    SupportedChainId.GNOSIS_CHAIN,
    '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d',
    DEFAULT_NATIVE_DECIMALS,
    'WXDAI',
    'Wrapped XDAI'
  ),
  [SupportedChainId.SEPOLIA]: new TokenWithLogo(
    ETH_LOGO_URL,
    SupportedChainId.SEPOLIA,
    '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14',
    DEFAULT_NATIVE_DECIMALS,
    'WETH',
    'Wrapped Ether'
  ),
}

export const NATIVE_CURRENCIES: Record<SupportedChainId, TokenWithLogo> = {
  [SupportedChainId.MAINNET]: new TokenWithLogo(
    undefined,
    SupportedChainId.MAINNET,
    NATIVE_CURRENCY_ADDRESS,
    DEFAULT_NATIVE_DECIMALS,
    'ETH',
    'Ether'
  ),
  [SupportedChainId.SEPOLIA]: new TokenWithLogo(
    undefined,
    SupportedChainId.SEPOLIA,
    NATIVE_CURRENCY_ADDRESS,
    DEFAULT_NATIVE_DECIMALS,
    'ETH',
    'Ether'
  ),
  [SupportedChainId.GNOSIS_CHAIN]: new TokenWithLogo(
    undefined,
    SupportedChainId.GNOSIS_CHAIN,
    NATIVE_CURRENCY_ADDRESS,
    DEFAULT_NATIVE_DECIMALS,
    'xDAI',
    'xDAI'
  ),
}

export const WETH_MAINNET = WRAPPED_NATIVE_CURRENCIES[SupportedChainId.MAINNET]
export const WXDAI = WRAPPED_NATIVE_CURRENCIES[SupportedChainId.GNOSIS_CHAIN]
export const WETH_SEPOLIA = WRAPPED_NATIVE_CURRENCIES[SupportedChainId.SEPOLIA]
