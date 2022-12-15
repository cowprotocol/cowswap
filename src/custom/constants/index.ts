import { Token, Fraction, Percent } from '@uniswap/sdk-core'
import { CoWSwapEthFlow as EthFlowBarn } from '@cowprotocol/ethflowcontract/networks.barn.json'
import { CoWSwapEthFlow as EthFlowProd } from '@cowprotocol/ethflowcontract/networks.prod.json'
import { GPv2Settlement, GPv2VaultRelayer } from '@cowprotocol/contracts/networks.json'

import { SupportedChainId as ChainId } from 'constants/chains'
import { getAppDataHash } from './appDataHash'
import ms from 'ms.macro'

import { CowSdk } from '@cowprotocol/cow-sdk'
import { PINATA_API_KEY, PINATA_SECRET_API_KEY } from 'constants/ipfs'

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

export const APP_DATA_HASH = getAppDataHash()
export const DEFAULT_APP_CODE = 'CoW Swap'
export const SAFE_APP_CODE = `${DEFAULT_APP_CODE}-SafeApp`

export const PRODUCTION_URL = 'swap.cow.fi'
export const BARN_URL = `barn.cow.fi`

export const APP_TITLE = 'CoW Swap | The smartest way to trade cryptocurrencies'

// Smart contract wallets are filtered out by default, no need to add them to this list
export const UNSUPPORTED_WC_WALLETS = new Set(['DeFi Wallet', 'WallETH'])

type Env = 'barn' | 'prod'

export const COWSWAP_ETHFLOW_CONTRACT_ADDRESS: Record<Env, Partial<Record<number, string>>> = {
  prod: {
    [ChainId.MAINNET]: EthFlowProd[ChainId.MAINNET].address,
    [ChainId.GNOSIS_CHAIN]: EthFlowProd[ChainId.GNOSIS_CHAIN].address,
    [ChainId.GOERLI]: EthFlowProd[ChainId.GOERLI].address,
  },
  barn: {
    [ChainId.MAINNET]: EthFlowBarn[ChainId.MAINNET].address,
    [ChainId.GNOSIS_CHAIN]: EthFlowBarn[ChainId.GNOSIS_CHAIN].address,
    [ChainId.GOERLI]: EthFlowBarn[ChainId.GOERLI].address,
  },
}

export const GP_SETTLEMENT_CONTRACT_ADDRESS: Partial<Record<number, string>> = {
  [ChainId.MAINNET]: GPv2Settlement[ChainId.MAINNET].address,
  [ChainId.GNOSIS_CHAIN]: GPv2Settlement[ChainId.GNOSIS_CHAIN].address,
  [ChainId.GOERLI]: GPv2Settlement[ChainId.GOERLI].address,
}

export const GP_VAULT_RELAYER: Partial<Record<number, string>> = {
  [ChainId.MAINNET]: GPv2VaultRelayer[ChainId.MAINNET].address,
  [ChainId.GNOSIS_CHAIN]: GPv2VaultRelayer[ChainId.GNOSIS_CHAIN].address,
  [ChainId.GOERLI]: GPv2VaultRelayer[ChainId.GOERLI].address,
}

export const V_COW_CONTRACT_ADDRESS: Record<number, string> = {
  [ChainId.MAINNET]: '0xd057b63f5e69cf1b929b356b579cba08d7688048',
  [ChainId.GNOSIS_CHAIN]: '0xc20C9C13E853fc64d054b73fF21d3636B2d97eaB',
  [ChainId.GOERLI]: '0x7B878668Cd1a3adF89764D3a331E0A7BB832192D',
}

export const COW_CONTRACT_ADDRESS: Record<number, string> = {
  [ChainId.MAINNET]: '0xDEf1CA1fb7FBcDC777520aa7f396b4E015F497aB',
  [ChainId.GNOSIS_CHAIN]: '0x177127622c4A00F3d409B75571e12cB3c8973d3c',
  [ChainId.GOERLI]: '0x91056D4A53E1faa1A84306D4deAEc71085394bC8',
}

// See https://github.com/cowprotocol/contracts/commit/821b5a8da213297b0f7f1d8b17c893c5627020af#diff-12bbbe13cd5cf42d639e34a39d8795021ba40d3ee1e1a8282df652eb161a11d6R13
export const NATIVE_CURRENCY_BUY_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
export const NATIVE_CURRENCY_BUY_TOKEN: { [chainId in ChainId | number]: Token } = {
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, NATIVE_CURRENCY_BUY_ADDRESS, 18, 'ETH', 'Ether'),
  // [ChainId.ROPSTEN]: new Token(ChainId.ROPSTEN, NATIVE_CURRENCY_BUY_ADDRESS, 18, 'ETH', 'Ether'),
  [ChainId.GOERLI]: new Token(ChainId.GOERLI, NATIVE_CURRENCY_BUY_ADDRESS, 18, 'ETH', 'Ether'),
  // [ChainId.KOVAN]: new Token(ChainId.KOVAN, NATIVE_CURRENCY_BUY_ADDRESS, 18, 'ETH', 'Ether'),
  [ChainId.GNOSIS_CHAIN]: new Token(ChainId.GNOSIS_CHAIN, NATIVE_CURRENCY_BUY_ADDRESS, 18, 'xDAI', 'xDAI'),
}

export const ORDER_ID_SHORT_LENGTH = 8
export const INPUT_OUTPUT_EXPLANATION = 'Only executed swaps incur fees.'
export const DEFAULT_ORDER_DELAY = 20000 // 20s
export const PENDING_ORDERS_BUFFER = 60 * 1000 // 60s
export const CANCELLED_ORDERS_PENDING_TIME = 5 * 60 * 1000 // 5min
export const PRICE_API_TIMEOUT_MS = 10000 // 10s
export const GP_ORDER_UPDATE_INTERVAL = 30 * 1000 // 30s
export const MINIMUM_ORDER_VALID_TO_TIME_SECONDS = 120
// Minimum deadline for EthFlow orders. Like the default deadline, anything smaller will be replaced by this
export const MINIMUM_ETH_FLOW_DEADLINE_SECONDS = 600 // 10 minutes in SECONDS

export const WETH_LOGO_URI =
  'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
export const XDAI_LOGO_URI =
  'https://raw.githubusercontent.com/1Hive/default-token-list/master/src/assets/xdai/0xe91d153e0b41518a2ce8dd3d7944fa863463a97d/logo.png'

const GITHUB_REPOSITORY = 'cowprotocol/cowswap'
export const CODE_LINK = 'https://github.com/' + GITHUB_REPOSITORY
export const RAW_CODE_LINK = 'https://raw.githubusercontent.com/' + GITHUB_REPOSITORY

export const DOCS_LINK = 'https://docs.cow.fi'
export const CONTRACTS_CODE_LINK = 'https://github.com/cowprotocol/contracts'
export const DISCORD_LINK = 'https://discord.com/invite/cowprotocol'
export const DUNE_DASHBOARD_LINK = 'https://dune.com/cowprotocol/Gnosis-Protocol-V2'
export const TWITTER_LINK = 'https://twitter.com/CoWSwap'
export const GPAUDIT_LINK = 'https://github.com/cowprotocol/contracts/blob/main/audits/GnosisProtocolV2May2021.pdf'
export const FLASHBOYS_LINK = 'https://arxiv.org/abs/1904.05234'
export const COWWIKI_LINK = 'https://en.wikipedia.org/wiki/Coincidence_of_wants'
export const GNOSIS_FORUM_ROADTODECENT_LINK = 'https://forum.gnosis.io/t/gpv2-road-to-decentralization/1245'

// MEV Metrics from https://explore.flashbots.net/
export const MEV_TOTAL = '606 Million'
export const FLASHBOTS_LINK = 'https://explore.flashbots.net/'

export const GAS_PRICE_UPDATE_THRESHOLD = ms`5s`
export const GAS_FEE_ENDPOINTS = {
  [ChainId.MAINNET]: 'https://api.blocknative.com/gasprices/blockprices',
  [ChainId.GNOSIS_CHAIN]: 'https://blockscout.com/xdai/mainnet/api/v1/gas-price-oracle',
  [ChainId.GOERLI]: '',
}
export const GAS_API_KEYS = {
  [ChainId.MAINNET]: process.env.REACT_APP_BLOCKNATIVE_API_KEY,
  [ChainId.GNOSIS_CHAIN]: '',
  [ChainId.GOERLI]: '',
}

export const UNSUPPORTED_TOKENS_FAQ_URL = '/faq/trading#what-token-pairs-does-cowswap-allow-to-trade'

// fee threshold - should be greater than percentage, show warning
export const FEE_SIZE_THRESHOLD = new Fraction(10, 100) // 30%

// default value provided as userAddress to Paraswap API if the user wallet is not connected
export const SOLVER_ADDRESS = '0xa6ddbd0de6b310819b49f680f65871bee85f517e'

export const MAXIMUM_ORDERS_TO_DISPLAY = 10
export const AMOUNT_OF_ORDERS_TO_FETCH = 100

// last wallet provider key used in local storage
export const STORAGE_KEY_LAST_PROVIDER = 'lastProvider'
export const WAITING_TIME_RECONNECT_LAST_PROVIDER = 15000 // 15s

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

// TODO: show banner warning when PINATA env vars are missing
const COW_SDK_OPTIONS = {
  ipfs: { pinataApiKey: PINATA_API_KEY, pinataApiSecret: PINATA_SECRET_API_KEY },
}

export const COW_SDK: Record<ChainId, CowSdk<ChainId>> = {
  [ChainId.MAINNET]: new CowSdk(ChainId.MAINNET, COW_SDK_OPTIONS),
  [ChainId.GOERLI]: new CowSdk(ChainId.GOERLI, COW_SDK_OPTIONS),
  [ChainId.GNOSIS_CHAIN]: new CowSdk(ChainId.GNOSIS_CHAIN, COW_SDK_OPTIONS),
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
  { title: 'Affiliate', url: '/faq/affiliate' },
  { title: 'Limit orders', url: '/faq/limit-order' },
]
