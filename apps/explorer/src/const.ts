import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { TokenErc20, UNLIMITED_ORDER_AMOUNT } from '@gnosis.pm/dex-js'
import BigNumber from 'bignumber.js'

export {
  ALLOWANCE_FOR_ENABLED_TOKEN,
  ALLOWANCE_MAX_VALUE,
  BATCH_TIME,
  DEFAULT_PRECISION,
  FEE_DENOMINATOR,
  FEE_PERCENTAGE,
  MAX_BATCH_ID,
  ONE,
  TEN,
  TWO,
  UNLIMITED_ORDER_AMOUNT,
  ZERO,
} from '@gnosis.pm/dex-js'

export const DEFAULT_TIMEOUT = 5000

export const ZERO_BIG_NUMBER = new BigNumber(0)
export const ONE_BIG_NUMBER = new BigNumber(1)
export const TEN_BIG_NUMBER = new BigNumber(10)
export const ONE_HUNDRED_BIG_NUMBER = new BigNumber(100)

// Value used on formatSmart's smallLimit for integer values, such as raw token amounts
export const MINIMUM_ATOM_VALUE = '1'

export const APP_NAME = 'CoW Protocol'

export const ETHER_PNG =
  'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'

export const UNLIMITED_ORDER_AMOUNT_BIGNUMBER = new BigNumber(UNLIMITED_ORDER_AMOUNT.toString())

// UI constants
export const HIGHLIGHT_TIME = 5000

export const DEFAULT_DECIMALS = 5
// The prices on the contract will update at max once every batch, which is 5min long
export const PRICES_CACHE_TIME = 60 // in seconds

export const MEDIA = {
  MOBILE_LARGE_PX: 500,
  tinyScreen: '320px',
  xSmallScreen: '430px',
  smallScreen: '736px',
  smallScreenUp: '737px',
  mediumScreenSmall: '850px',
  mediumEnd: '1024px',
  desktopScreen: '1025px',
  desktopScreenLarge: '1366px',
  get tinyDown(): string {
    return `only screen and (max-width : ${this.tinyScreen})`
  },
  get xSmallDown(): string {
    return `only screen and (max-width : ${this.xSmallScreen})`
  },
  get mobile(): string {
    return `only screen and (max-width : ${this.smallScreen})`
  },
  get mediumUp(): string {
    return `only screen and (min-width : ${this.smallScreenUp})`
  },
  get mediumDown(): string {
    return `only screen and (max-width : ${this.mediumEnd})`
  },
  get mediumOnly(): string {
    return `only screen and (min-width : ${this.smallScreenUp}) and (max-width : ${this.mediumEnd})`
  },
  get desktop(): string {
    return `only screen and (min-width : ${this.desktopScreen})`
  },
  get desktopLarge(): string {
    return `only screen and (min-width: ${this.desktopScreenLarge})`
  },
  get tabletPortrait(): string {
    return `(min-device-width: ${this.smallScreenUp}) and (max-device-width: ${this.mediumEnd}) and (orientation: portrait)`
  },
  get tabletLandscape(): string {
    return `(min-device-width: ${this.smallScreenUp}) and (max-device-width: ${this.mediumEnd}) and (orientation: landscape)`
  },
  get tablet(): string {
    return `(min-width: ${this.smallScreenUp}) and (max-width: ${this.mediumEnd}), ${this.tabletPortrait}, ${this.tabletLandscape}`
  },
  get tabletNoPortrait(): string {
    return `(min-width: ${this.smallScreenUp}) and (max-width: ${this.mediumEnd}), ${this.tabletLandscape}`
  },
  get tabletSmall(): string {
    return `(min-width: ${this.smallScreenUp}) and (max-width: ${this.mediumScreenSmall})`
  },
}

export const WETH_ADDRESS_MAINNET = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
export const WXDAI_ADDRESS_XDAI = '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d'
export const WETH_ADDRESS_ARBITRUM_ONE = '0x82af49447d8a07e3bd95bd0d56f35241523fbab1'
export const WETH_ADDRESS_BASE = '0x4200000000000000000000000000000000000006'
export const WETH_ADDRESS_SEPOLIA = '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14'
export const WPOL_ADDRESS_POLYGON = '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270'
export const WAVAX_ADDRESS_AVALANCHE = '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7'
export const NATIVE_TOKEN_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
export const NATIVE_TOKEN_ADDRESS_LOWERCASE = NATIVE_TOKEN_ADDRESS.toLowerCase()

export const WRAPPED_NATIVE_ADDRESS: Record<SupportedChainId, string> = {
  [SupportedChainId.MAINNET]: WETH_ADDRESS_MAINNET,
  [SupportedChainId.GNOSIS_CHAIN]: WXDAI_ADDRESS_XDAI,
  [SupportedChainId.ARBITRUM_ONE]: WETH_ADDRESS_ARBITRUM_ONE,
  [SupportedChainId.BASE]: WETH_ADDRESS_BASE,
  [SupportedChainId.SEPOLIA]: WETH_ADDRESS_SEPOLIA,
  [SupportedChainId.POLYGON]: WPOL_ADDRESS_POLYGON,
  [SupportedChainId.AVALANCHE]: WAVAX_ADDRESS_AVALANCHE,
}

export const ETH: TokenErc20 = {
  name: 'ETH',
  symbol: 'ETH',
  decimals: 18,
  address: NATIVE_TOKEN_ADDRESS,
}

export const XDAI: TokenErc20 = {
  name: 'xDai',
  symbol: 'xDai',
  decimals: 18,
  address: NATIVE_TOKEN_ADDRESS,
}

export const POL: TokenErc20 = {
  name: 'POL',
  symbol: 'POL',
  decimals: 18,
  address: NATIVE_TOKEN_ADDRESS,
}

export const AVAX: TokenErc20 = {
  name: 'AVAX',
  symbol: 'AVAX',
  decimals: 18,
  address: NATIVE_TOKEN_ADDRESS,
}

export const NATIVE_TOKEN_PER_NETWORK: Record<SupportedChainId, TokenErc20> = {
  [SupportedChainId.MAINNET]: ETH,
  [SupportedChainId.GNOSIS_CHAIN]: XDAI,
  [SupportedChainId.ARBITRUM_ONE]: ETH,
  [SupportedChainId.BASE]: ETH,
  [SupportedChainId.SEPOLIA]: ETH,
  [SupportedChainId.POLYGON]: POL,
  [SupportedChainId.AVALANCHE]: AVAX,
}

export const TENDERLY_API_URL = 'https://api.tenderly.co/api/v1/public-contract'
export const DEFAULT_IPFS_READ_URI = process.env.REACT_APP_IPFS_READ_URI || 'https://ipfs.io/ipfs'
export const IPFS_INVALID_APP_IDS = [
  '0x0000000000000000000000000000000000000000000000000000000000000000',
  '0x0000000000000000000000000000000000000000000000000000000000000001',
  '0x0000000000000000000000000000000000000000000000000000000000000002',
  '0xf6a005bde820da47fdbb19bc07e56782b9ccec403a6899484cf502090627af8a',
  '0x00000000000000000000000055662e225a3376759c24331a9aed764f8f0c9fbb',
]

/**
 * The maximum percentage of the surplus that can be used for the surplus
 * Values above this will not be displayed.
 * Instead, the Surplus amount will be used
 */
export const MAX_SURPLUS_PERCENTAGE = '1000'
