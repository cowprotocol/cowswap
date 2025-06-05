import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { cowprotocolTokenLogoUrl } from './cowprotocolTokenLogoUrl'
import { TokenWithLogo } from './types'

export const NATIVE_CURRENCY_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'

const DEFAULT_NATIVE_DECIMALS = 18
const WETH9_MAINNET_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
const ETH_LOGO_URL = cowprotocolTokenLogoUrl(WETH9_MAINNET_ADDRESS.toLowerCase(), SupportedChainId.MAINNET)
const AVAX_LOGO_URL = cowprotocolTokenLogoUrl(NATIVE_CURRENCY_ADDRESS, SupportedChainId.AVALANCHE)
const POL_LOGO_URL = cowprotocolTokenLogoUrl(NATIVE_CURRENCY_ADDRESS, SupportedChainId.POLYGON)

export const WRAPPED_NATIVE_CURRENCIES: Record<SupportedChainId, TokenWithLogo> = {
  [SupportedChainId.MAINNET]: new TokenWithLogo(
    ETH_LOGO_URL,
    SupportedChainId.MAINNET,
    WETH9_MAINNET_ADDRESS,
    DEFAULT_NATIVE_DECIMALS,
    'WETH',
    'Wrapped Ether',
  ),
  [SupportedChainId.GNOSIS_CHAIN]: new TokenWithLogo(
    undefined,
    SupportedChainId.GNOSIS_CHAIN,
    '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d',
    DEFAULT_NATIVE_DECIMALS,
    'WXDAI',
    'Wrapped XDAI',
  ),
  [SupportedChainId.ARBITRUM_ONE]: new TokenWithLogo(
    ETH_LOGO_URL,
    SupportedChainId.ARBITRUM_ONE,
    '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    DEFAULT_NATIVE_DECIMALS,
    'WETH',
    'Wrapped Ether',
  ),
  [SupportedChainId.BASE]: new TokenWithLogo(
    ETH_LOGO_URL,
    SupportedChainId.BASE,
    '0x4200000000000000000000000000000000000006',
    DEFAULT_NATIVE_DECIMALS,
    'WETH',
    'Wrapped Ether',
  ),
  [SupportedChainId.SEPOLIA]: new TokenWithLogo(
    ETH_LOGO_URL,
    SupportedChainId.SEPOLIA,
    '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14',
    DEFAULT_NATIVE_DECIMALS,
    'WETH',
    'Wrapped Ether',
  ),
  [SupportedChainId.POLYGON]: new TokenWithLogo(
    undefined,
    SupportedChainId.POLYGON,
    '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
    DEFAULT_NATIVE_DECIMALS,
    'WPOL',
    'Wrapped POL',
  ),
  [SupportedChainId.AVALANCHE]: new TokenWithLogo(
    undefined,
    SupportedChainId.AVALANCHE,
    '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7',
    DEFAULT_NATIVE_DECIMALS,
    'WAVAX',
    'Wrapped AVAX',
  ),
}

export const NATIVE_CURRENCIES: Record<SupportedChainId, TokenWithLogo> = {
  [SupportedChainId.MAINNET]: new TokenWithLogo(
    undefined,
    SupportedChainId.MAINNET,
    NATIVE_CURRENCY_ADDRESS,
    DEFAULT_NATIVE_DECIMALS,
    'ETH',
    'Ether',
  ),
  [SupportedChainId.GNOSIS_CHAIN]: new TokenWithLogo(
    undefined,
    SupportedChainId.GNOSIS_CHAIN,
    NATIVE_CURRENCY_ADDRESS,
    DEFAULT_NATIVE_DECIMALS,
    'xDAI',
    'xDAI',
  ),
  [SupportedChainId.ARBITRUM_ONE]: new TokenWithLogo(
    undefined,
    SupportedChainId.ARBITRUM_ONE,
    NATIVE_CURRENCY_ADDRESS,
    DEFAULT_NATIVE_DECIMALS,
    'ETH',
    'Ether',
  ),
  [SupportedChainId.BASE]: new TokenWithLogo(
    undefined,
    SupportedChainId.BASE,
    NATIVE_CURRENCY_ADDRESS,
    DEFAULT_NATIVE_DECIMALS,
    'ETH',
    'Ether',
  ),
  [SupportedChainId.SEPOLIA]: new TokenWithLogo(
    undefined,
    SupportedChainId.SEPOLIA,
    NATIVE_CURRENCY_ADDRESS,
    DEFAULT_NATIVE_DECIMALS,
    'ETH',
    'Ether',
  ),
  [SupportedChainId.POLYGON]: new TokenWithLogo(
    POL_LOGO_URL,
    SupportedChainId.POLYGON,
    NATIVE_CURRENCY_ADDRESS,
    DEFAULT_NATIVE_DECIMALS,
    'POL',
    'Polygon',
  ),
  [SupportedChainId.AVALANCHE]: new TokenWithLogo(
    AVAX_LOGO_URL,
    SupportedChainId.AVALANCHE,
    NATIVE_CURRENCY_ADDRESS,
    DEFAULT_NATIVE_DECIMALS,
    'AVAX',
    'Avalanche',
  ),
}

export const WETH_MAINNET = WRAPPED_NATIVE_CURRENCIES[SupportedChainId.MAINNET]
export const WXDAI = WRAPPED_NATIVE_CURRENCIES[SupportedChainId.GNOSIS_CHAIN]
export const WETH_SEPOLIA = WRAPPED_NATIVE_CURRENCIES[SupportedChainId.SEPOLIA]
