import { SupportedChainId, mapSupportedNetworks } from '@cowprotocol/cow-sdk'
import { Fraction, Percent } from '@uniswap/sdk-core'

import BigNumber from 'bignumber.js'
import ms from 'ms.macro'

// TODO: move those consts to src/constants/common

export const ZERO_BIG_NUMBER = new BigNumber(0)
export const ZERO_FRACTION = new Fraction(0)

export const DEFAULT_SLIPPAGE_BPS = 50 // 0.5%
export const MAX_SLIPPAGE_BPS = 5000 // 50%
export const MIN_SLIPPAGE_BPS = 0 // 0%
export const HIGH_SLIPPAGE_BPS = 100 // 1%
export const LOW_SLIPPAGE_BPS = 5 // 0.05%
export const INITIAL_ALLOWED_SLIPPAGE_PERCENT = new Percent(DEFAULT_SLIPPAGE_BPS, 10_000) // 0.5%
export const RADIX_DECIMAL = 10
export const RADIX_HEX = 16

export const DEFAULT_DECIMALS = 18
export const DEFAULT_PRECISION = 6
export const AMOUNT_PRECISION = 4
export const LONG_PRECISION = 10
export const FULL_PRICE_PRECISION = 20
export const FIAT_PRECISION = 2
export const PERCENTAGE_PRECISION = 2

export const SHORT_LOAD_THRESHOLD = 500
export const LONG_LOAD_THRESHOLD = 2000

export const AVG_APPROVE_COST_GWEI = '50000'
export const DEFAULT_APP_CODE = 'CoW Swap'
export const SAFE_APP_CODE = `${DEFAULT_APP_CODE}-SafeApp`

export const APP_TITLE = 'CoW Swap | The smartest way to trade cryptocurrencies'

export const PAGE_TITLES = {
  SWAP: 'Swap',
  LIMIT_ORDERS: 'Limit Orders',
  YIELD: 'Yield',
  ADVANCED: 'TWAP',
  ACCOUNT_OVERVIEW: 'Account Overview',
  TOKENS_OVERVIEW: 'Tokens Overview',
  COW_RUNNER: 'CoW Runner',
  MEV_SLICER: 'Mev Slicer',
  HOOKS: 'Hooks',
}

type Env = 'barn' | 'prod'

const NEW_COWSWAP_ETHFLOW_CONTRACT_ADDRESS: Record<Env, string> = {
  prod: '0xba3cb449bd2b4adddbc894d8697f5170800eadec',
  barn: '0x04501b9b1d52e67f6862d157e00d13419d2d6e95',
}

export function getEthFlowContractAddresses(env: Env): string {
  return NEW_COWSWAP_ETHFLOW_CONTRACT_ADDRESS[env]
}

export const V_COW_CONTRACT_ADDRESS: Record<SupportedChainId, string | null> = {
  [SupportedChainId.MAINNET]: '0xd057b63f5e69cf1b929b356b579cba08d7688048',
  [SupportedChainId.GNOSIS_CHAIN]: '0xc20C9C13E853fc64d054b73fF21d3636B2d97eaB',
  [SupportedChainId.ARBITRUM_ONE]: null, // doesn't exist!
  [SupportedChainId.BASE]: null, // doesn't exist!
  [SupportedChainId.SEPOLIA]: '0x21d06a222bbb94ec1406a0a8ba86b4d761bc9864',
  [SupportedChainId.POLYGON]: null, //doesn't exist!
  [SupportedChainId.AVALANCHE]: null, // doesn't exist!
}

export const COW_CONTRACT_ADDRESS: Record<SupportedChainId, string | null> = {
  [SupportedChainId.MAINNET]: '0xDEf1CA1fb7FBcDC777520aa7f396b4E015F497aB',
  [SupportedChainId.GNOSIS_CHAIN]: '0x177127622c4A00F3d409B75571e12cB3c8973d3c',
  [SupportedChainId.ARBITRUM_ONE]: '0xcb8b5cd20bdcaea9a010ac1f8d835824f5c87a04',
  [SupportedChainId.BASE]: '0xc694a91e6b071bF030A18BD3053A7fE09B6DaE69',
  [SupportedChainId.SEPOLIA]: '0x0625aFB445C3B6B7B929342a04A22599fd5dBB59',
  // https://polygonscan.com/token/0x2f4efd3aa42e15a1ec6114547151b63ee5d39958
  [SupportedChainId.POLYGON]: '0x2f4efd3aa42e15a1ec6114547151b63ee5d39958',
  [SupportedChainId.AVALANCHE]: null,
}

export const INPUT_OUTPUT_EXPLANATION = 'Only executed swaps incur fees.'
export const PENDING_ORDERS_BUFFER = ms`60s` // 60s
export const CANCELLED_ORDERS_PENDING_TIME = ms`5min` // 5min
export const PRICE_API_TIMEOUT_MS = ms`10s` // 10s
export const ORDER_BOOK_API_UPDATE_INTERVAL = ms`30s` // 30s
export const MINIMUM_ORDER_VALID_TO_TIME_SECONDS = 120
// Minimum deadline for EthFlow orders. Like the default deadline, anything smaller will be replaced by this
export const MINIMUM_ETH_FLOW_DEADLINE_SECONDS = 600 // 10 minutes in SECONDS

export const MINIMUM_ETH_FLOW_SLIPPAGE_BPS: Record<SupportedChainId, number> = {
  [SupportedChainId.MAINNET]: 200, // 2%
  [SupportedChainId.GNOSIS_CHAIN]: DEFAULT_SLIPPAGE_BPS,
  [SupportedChainId.ARBITRUM_ONE]: DEFAULT_SLIPPAGE_BPS,
  [SupportedChainId.BASE]: DEFAULT_SLIPPAGE_BPS,
  [SupportedChainId.SEPOLIA]: DEFAULT_SLIPPAGE_BPS,
  [SupportedChainId.POLYGON]: DEFAULT_SLIPPAGE_BPS,
  [SupportedChainId.AVALANCHE]: DEFAULT_SLIPPAGE_BPS,
}

export const MINIMUM_ETH_FLOW_SLIPPAGE: Record<SupportedChainId, Percent> = mapSupportedNetworks(
  (chainId) => new Percent(MINIMUM_ETH_FLOW_SLIPPAGE_BPS[chainId], 10_000),
)
export const HIGH_ETH_FLOW_SLIPPAGE_BPS = 1_000 // 10%

const GITHUB_REPOSITORY = 'cowprotocol/cowswap'
export const CODE_LINK = 'https://github.com/' + GITHUB_REPOSITORY
export const RAW_CODE_LINK = 'https://raw.githubusercontent.com/' + GITHUB_REPOSITORY

export const COW_PROTOCOL_LINK = 'https://cow.fi'
export const COWDAO_KNOWLEDGE_BASE_LINK = 'https://cow.fi/learn'
export const COWDAO_LEGAL_LINK = 'https://cow.fi/legal'
export const COWDAO_COWSWAP_ABOUT_LINK = 'https://cow.fi/cow-swap'
export const DOCS_LINK = 'https://docs.cow.fi'
export const CONTRACTS_CODE_LINK = 'https://github.com/cowprotocol/contracts'
export const DISCORD_LINK = 'https://discord.com/invite/cowprotocol'
export const DUNE_DASHBOARD_LINK = 'https://dune.com/cowprotocol/cowswap'
export const TWITTER_LINK = 'https://twitter.com/CoWSwap'
export const GPAUDIT_LINK = 'https://github.com/cowprotocol/contracts/blob/main/audits/GnosisProtocolV2May2021.pdf'
export const FLASHBOYS_LINK = 'https://arxiv.org/abs/1904.05234'
export const COWWIKI_LINK = 'https://en.wikipedia.org/wiki/Coincidence_of_wants'
export const WIDGET_LANDING_LINK = 'https://cow.fi/widget'
export const GNOSIS_FORUM_ROADTODECENT_LINK = 'https://forum.gnosis.io/t/gpv2-road-to-decentralization/1245'

// MEV Metrics from https://explore.flashbots.net/
export const MEV_TOTAL = '606 Million'
export const FLASHBOTS_LINK = 'https://explore.flashbots.net/'

// TODO: test gas prices for all networks
export const GAS_PRICE_UPDATE_THRESHOLD = ms`5s`
export const GAS_FEE_ENDPOINTS: Record<SupportedChainId, string> = {
  [SupportedChainId.MAINNET]: 'https://api.blocknative.com/gasprices/blockprices',
  [SupportedChainId.GNOSIS_CHAIN]: 'https://gnosis.blockscout.com/api/v1/gas-price-oracle',
  [SupportedChainId.ARBITRUM_ONE]: 'https://arbitrum.blockscout.com/api/v1/gas-price-oracle',
  [SupportedChainId.BASE]: 'https://base.blockscout.com/api/v1/gas-price-oracle',
  [SupportedChainId.SEPOLIA]: '',
  [SupportedChainId.POLYGON]: 'https://polygon.blockscout.com/api/v1/gas-price-oracle',
  [SupportedChainId.AVALANCHE]: 'https://api.blocknative.com/gasprices/blockprices?chainid=43114',
}
export const GAS_API_KEYS: Record<SupportedChainId, string | null> = {
  [SupportedChainId.MAINNET]: process.env.REACT_APP_BLOCKNATIVE_API_KEY || null,
  [SupportedChainId.GNOSIS_CHAIN]: null,
  [SupportedChainId.ARBITRUM_ONE]: null,
  [SupportedChainId.BASE]: null,
  [SupportedChainId.SEPOLIA]: null,
  [SupportedChainId.POLYGON]: null,
  [SupportedChainId.AVALANCHE]: process.env.REACT_APP_BLOCKNATIVE_API_KEY || null,
}

export const UNSUPPORTED_TOKENS_FAQ_URL = 'https://docs.cow.fi/cow-protocol/reference/core/tokens'

// fee threshold - should be greater than percentage, show warning
export const FEE_SIZE_THRESHOLD = 10 // 10%

// default value provided as userAddress to Paraswap API if the user wallet is not connected
export const SOLVER_ADDRESS = '0xa6ddbd0de6b310819b49f680f65871bee85f517e'

export const MAXIMUM_ORDERS_TO_DISPLAY = 10
export const AMOUNT_OF_ORDERS_TO_FETCH = 100

// Default price strategy to use for getting app prices
// COWSWAP = new quote endpoint
// LEGACY = price racing logic (checking 0x, gp, paraswap, etc)
export const DEFAULT_PRICE_STRATEGY = 'COWSWAP'

// Start date of COW vesting for locked GNO
export const LOCKED_GNO_VESTING_START_DATE = new Date('02-11-2022 13:05:15 GMT')

// These values match the vesting contract configuration (see contract's `cliffTime` and `duration` fields).
// They are fixed and will never change.
export const LOCKED_GNO_VESTING_START_TIME = 1644584715000
export const LOCKED_GNO_VESTING_DURATION = 126144000000 // 4 years

export const SWR_OPTIONS = {
  refreshInterval: ms`30s`,
  dedupingInterval: ms`10s`,
  // don't revalidate data on focus, can cause too many re-renders
  // see https://koba04.medium.com/revalidating-options-of-swr-4d9f08bee813
  revalidateOnFocus: false,
}

export const SWR_NO_REFRESH_OPTIONS = {
  // Cache indefinitely
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  refreshInterval: 0,
}

// These are used for Account sidebar menu
export const ACCOUNT_MENU_LINKS = [
  { title: 'Overview', url: '/account' },
  { title: 'Tokens', url: '/account/tokens' },
  // { title: 'Governance', url: '/account/governance' },
  // { title: 'Affiliate', url: '/account/affiliate' },
]

// Min USD value to show surplus
export const MIN_FIAT_SURPLUS_VALUE = 0.01

// Min FIAT value for displaying the surplus modal
export const MIN_FIAT_SURPLUS_VALUE_MODAL = 1

// Min surplus value in units for displaying the surplus modal when FIAT value is not available
export const MIN_SURPLUS_UNITS = 0.01
