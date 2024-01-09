import BigNumber from 'bignumber.js'
import BN from 'bn.js'
import { BATCH_TIME, TokenErc20, UNLIMITED_ORDER_AMOUNT } from '@gnosis.pm/dex-js'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

export {
  UNLIMITED_ORDER_AMOUNT,
  FEE_DENOMINATOR,
  BATCH_TIME,
  MAX_BATCH_ID,
  FEE_PERCENTAGE,
  DEFAULT_PRECISION,
  ZERO,
  ONE,
  TWO,
  TEN,
  ALLOWANCE_MAX_VALUE,
  ALLOWANCE_FOR_ENABLED_TOKEN,
} from '@gnosis.pm/dex-js'

export const BATCH_TIME_IN_MS = BATCH_TIME * 1000
export const DEFAULT_TIMEOUT = 5000

export const CHAIN_CALLS_RATE_LIMIT = 0 // ms between blockchain calls, 0 = disabled

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

export const BATCH_SUBMISSION_CLOSE_TIME = 4 // in minutes

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

export const INFURA_ID = process.env.INFURA_ID || 'e941376b017d4dada26dc7891456fa3b'
export const ETH_NODE_URL = process.env.ETH_NODE_URL || 'wss://mainnet.infura.io/ws/v3/' + INFURA_ID

const LIQUIDITY_TOKEN_LIST_VALUES = process.env.LIQUIDITY_TOKEN_LIST || 'USDT,TUSD,USDC,PAX,GUSD,DAI,sUSD'
export const LIQUIDITY_TOKEN_LIST = new Set(LIQUIDITY_TOKEN_LIST_VALUES.split(',').map((symbol) => symbol.trim()))

export const WETH_ADDRESS_MAINNET = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
export const WETH_ADDRESS_GOERLI = '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6'
export const WETH_ADDRESS_SEPOLIA = '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14'
export const WXDAI_ADDRESS_XDAI = '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d'
export const WETH_ADDRESS_XDAI = '0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1'
export const NATIVE_TOKEN_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
export const NATIVE_TOKEN_ADDRESS_LOWERCASE = NATIVE_TOKEN_ADDRESS.toLowerCase()

export const WRAPPED_NATIVE_ADDRESS: Record<SupportedChainId, string> = {
  [SupportedChainId.MAINNET]: WETH_ADDRESS_MAINNET,
  [SupportedChainId.GOERLI]: WETH_ADDRESS_GOERLI,
  [SupportedChainId.GNOSIS_CHAIN]: WXDAI_ADDRESS_XDAI,
  [SupportedChainId.SEPOLIA]: WETH_ADDRESS_SEPOLIA,
}

export const ORDER_BOOK_HOPS_MAX = 30

/** ERROR CODES **/
// https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1474.md
export const LIMIT_EXCEEDED_ERROR_CODE = -32005

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

export const NATIVE_TOKEN_PER_NETWORK: Record<string, TokenErc20> = {
  '1': ETH,
  '5': ETH,
  '100': XDAI,
}

export const NO_REDIRECT_HOME_ROUTES: Array<string> = ['/address']

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
