import { ethFlowBarnJson, ethFlowProdJson } from '@cowprotocol/abis'
import {
  COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS,
  COW_PROTOCOL_VAULT_RELAYER_ADDRESS,
  IpfsConfig,
  SupportedChainId,
} from '@cowprotocol/cow-sdk'
import { Fraction, Percent } from '@uniswap/sdk-core'

import BigNumber from 'bignumber.js'
import ms from 'ms.macro'

import { PINATA_API_KEY, PINATA_SECRET_API_KEY } from './ipfs'

// TODO: move those consts to src/constants/common

const EthFlowBarn = ethFlowBarnJson.CoWSwapEthFlow
const EthFlowProd = ethFlowProdJson.CoWSwapEthFlow

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
export const DEFAULT_SMALL_LIMIT = '0.000001'
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

export const PRODUCTION_URL = 'swap.cow.fi'
export const BARN_URL = `barn.cow.fi`

export const APP_TITLE = 'CoW Swap | The smartest way to trade cryptocurrencies'

type Env = 'barn' | 'prod'

export const COWSWAP_ETHFLOW_CONTRACT_ADDRESS: Record<Env, Partial<Record<SupportedChainId, string>>> = {
  prod: {
    [SupportedChainId.MAINNET]: EthFlowProd[SupportedChainId.MAINNET].address,
    [SupportedChainId.GNOSIS_CHAIN]: EthFlowProd[SupportedChainId.GNOSIS_CHAIN].address,
    [SupportedChainId.SEPOLIA]: EthFlowProd[SupportedChainId.SEPOLIA].address,
  },
  barn: {
    [SupportedChainId.MAINNET]: EthFlowBarn[SupportedChainId.MAINNET].address,
    [SupportedChainId.GNOSIS_CHAIN]: EthFlowBarn[SupportedChainId.GNOSIS_CHAIN].address,
    [SupportedChainId.SEPOLIA]: EthFlowBarn[SupportedChainId.SEPOLIA].address,
  },
}

export const GP_SETTLEMENT_CONTRACT_ADDRESS = COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS

export const GP_VAULT_RELAYER = COW_PROTOCOL_VAULT_RELAYER_ADDRESS

export const V_COW_CONTRACT_ADDRESS: Record<SupportedChainId, string> = {
  [SupportedChainId.MAINNET]: '0xd057b63f5e69cf1b929b356b579cba08d7688048',
  [SupportedChainId.GNOSIS_CHAIN]: '0xc20C9C13E853fc64d054b73fF21d3636B2d97eaB',
  [SupportedChainId.SEPOLIA]: '0x21d06a222bbb94ec1406a0a8ba86b4d761bc9864',
}

export const COW_CONTRACT_ADDRESS: Record<SupportedChainId, string> = {
  [SupportedChainId.MAINNET]: '0xDEf1CA1fb7FBcDC777520aa7f396b4E015F497aB',
  [SupportedChainId.GNOSIS_CHAIN]: '0x177127622c4A00F3d409B75571e12cB3c8973d3c',
  [SupportedChainId.SEPOLIA]: '0x0625aFB445C3B6B7B929342a04A22599fd5dBB59',
}

export const INPUT_OUTPUT_EXPLANATION = 'Only executed swaps incur fees.'
export const PENDING_ORDERS_BUFFER = ms`60s` // 60s
export const CANCELLED_ORDERS_PENDING_TIME = ms`5min` // 5min
export const PRICE_API_TIMEOUT_MS = ms`10s` // 10s
export const GP_ORDER_UPDATE_INTERVAL = ms`30s` // 30s
export const MINIMUM_ORDER_VALID_TO_TIME_SECONDS = 120
// Minimum deadline for EthFlow orders. Like the default deadline, anything smaller will be replaced by this
export const MINIMUM_ETH_FLOW_DEADLINE_SECONDS = 600 // 10 minutes in SECONDS
export const MINIMUM_ETH_FLOW_SLIPPAGE_BPS = 200 // 2%
export const MINIMUM_ETH_FLOW_SLIPPAGE = new Percent(MINIMUM_ETH_FLOW_SLIPPAGE_BPS, 10_000) // 2%
export const HIGH_ETH_FLOW_SLIPPAGE_BPS = 1_000 // 10%

export const WETH_LOGO_URI =
  'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
export const XDAI_LOGO_URI =
  'https://raw.githubusercontent.com/1Hive/default-token-list/master/src/assets/xdai/0xe91d153e0b41518a2ce8dd3d7944fa863463a97d/logo.png'

const GITHUB_REPOSITORY = 'cowprotocol/cowswap'
export const CODE_LINK = 'https://github.com/' + GITHUB_REPOSITORY
export const RAW_CODE_LINK = 'https://raw.githubusercontent.com/' + GITHUB_REPOSITORY

export const COW_PROTOCOL_LINK = 'https://cow.fi/'
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

export const GAS_PRICE_UPDATE_THRESHOLD = ms`5s`
export const GAS_FEE_ENDPOINTS: Record<SupportedChainId, string> = {
  [SupportedChainId.MAINNET]: 'https://api.blocknative.com/gasprices/blockprices',
  [SupportedChainId.GNOSIS_CHAIN]: 'https://gnosis.blockscout.com/api/v1/gas-price-oracle',
  [SupportedChainId.SEPOLIA]: '',
}
export const GAS_API_KEYS: Record<SupportedChainId, string> = {
  [SupportedChainId.MAINNET]: process.env.REACT_APP_BLOCKNATIVE_API_KEY || '',
  [SupportedChainId.GNOSIS_CHAIN]: '',
  [SupportedChainId.SEPOLIA]: '',
}

export const UNSUPPORTED_TOKENS_FAQ_URL = '/faq/trading#what-token-pairs-does-cowswap-allow-to-trade'

// fee threshold - should be greater than percentage, show warning
export const FEE_SIZE_THRESHOLD = 10 // 10%

// default value provided as userAddress to Paraswap API if the user wallet is not connected
export const SOLVER_ADDRESS = '0xa6ddbd0de6b310819b49f680f65871bee85f517e'

export const MAXIMUM_ORDERS_TO_DISPLAY = 10
export const AMOUNT_OF_ORDERS_TO_FETCH = 100

// Default price strategy to use for getting app prices
// COWSWAP = new quote endpoint
// LEGACY = price racing logic (checking 0x, gp, paraswap, etc)
export const DEFAULT_GP_PRICE_STRATEGY = 'COWSWAP'

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

// TODO: show banner warning when PINATA env vars are missing
export const COW_IPFS_OPTIONS: IpfsConfig = {
  pinataApiKey: PINATA_API_KEY,
  pinataApiSecret: PINATA_SECRET_API_KEY,
}

// These are used for Account sidebar menu
export const ACCOUNT_MENU_LINKS = [
  { title: 'Overview', url: '/account' },
  { title: 'Tokens', url: '/account/tokens' },
  // { title: 'Governance', url: '/account/governance' },
  // { title: 'Affiliate', url: '/account/affiliate' },
]

// These are used for FAQ sidebar menu
export const FAQ_MENU_LINKS = [
  { title: 'General', url: '/faq' },
  { title: 'Protocol', url: '/faq/protocol' },
  { title: 'Token', url: '/faq/token' },
  { title: 'Trading', url: '/faq/trading' },
  { title: 'Limit orders', url: '/faq/limit-order' },
  { title: 'Selling Native tokens', url: '/faq/sell-native' },
]

// Min USD value to show surplus
export const MIN_FIAT_SURPLUS_VALUE = 0.01

// Min FIAT value for displaying the surplus modal
export const MIN_FIAT_SURPLUS_VALUE_MODAL = 1

// Min surplus value in units for displaying the surplus modal when FIAT value is not available
export const MIN_SURPLUS_UNITS = 0.01
