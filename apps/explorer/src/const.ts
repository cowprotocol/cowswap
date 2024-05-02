import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { TokenErc20, UNLIMITED_ORDER_AMOUNT } from '@gnosis.pm/dex-js'
import BigNumber from 'bignumber.js'
import BN from 'bn.js'

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

// How much of the order needs to be matched to consider it filled
// Will divide the total sell amount by this factor.
// E.g.: Sell = 500; ORDER_FILLED_FACTOR = 100 (1%) => 500/100 => 5
// ∴ when the amount is < 5 the order will be considered filled.
export const ORDER_FILLED_FACTOR = new BN(10000) // 0.01%
// Similar to the ORDER_FILLED_FACTOR, but for the explorer, and using a different calculation
// Order is considered `filled` when less than FILLED_ORDER_EPSILON is left
export const FILLED_ORDER_EPSILON = new BigNumber('0.0001') // == 0.01%

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

export const NODE_PROVIDER_ID = process.env.NODE_PROVIDER_ID || 'ed3c6720eb3f470e9ceac8f8f12e8b14'
export const ETH_NODE_URL = process.env.ETH_NODE_URL || 'wss://eth-mainnet.nodereal.io/ws/v1/' + NODE_PROVIDER_ID

export const WETH_ADDRESS_MAINNET = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
export const WETH_ADDRESS_SEPOLIA = '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14'
export const WXDAI_ADDRESS_XDAI = '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d'
export const NATIVE_TOKEN_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
export const NATIVE_TOKEN_ADDRESS_LOWERCASE = NATIVE_TOKEN_ADDRESS.toLowerCase()

export const WRAPPED_NATIVE_ADDRESS: Record<SupportedChainId, string> = {
  [SupportedChainId.MAINNET]: WETH_ADDRESS_MAINNET,
  [SupportedChainId.GNOSIS_CHAIN]: WXDAI_ADDRESS_XDAI,
  [SupportedChainId.SEPOLIA]: WETH_ADDRESS_SEPOLIA,
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

export const NATIVE_TOKEN_PER_NETWORK: Record<SupportedChainId, TokenErc20> = {
  [SupportedChainId.MAINNET]: ETH,
  [SupportedChainId.SEPOLIA]: ETH,
  [SupportedChainId.GNOSIS_CHAIN]: XDAI,
}

export const TENDERLY_API_URL = 'https://api.tenderly.co/api/v1/public-contract'
export const DEFAULT_IPFS_READ_URI = process.env.REACT_APP_IPFS_READ_URI || 'https://cloudflare-ipfs.com/ipfs'
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
