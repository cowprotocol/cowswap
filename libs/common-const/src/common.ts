import {
  BARN_ETH_FLOW_ADDRESSES,
  CowEnv,
  ETH_FLOW_ADDRESSES,
  mapSupportedNetworks,
  SupportedChainId,
} from '@cowprotocol/cow-sdk'
import { Fraction, Percent } from '@uniswap/sdk-core'

import { msg } from '@lingui/core/macro'
import JSBI from 'jsbi'
import ms from 'ms.macro'

export const ZERO_FRACTION = new Fraction(0)
export const ZERO = JSBI.BigInt(0)

export const DEFAULT_SLIPPAGE_BPS = 50 // 0.5%
export const MAX_SLIPPAGE_BPS = 5000 // 50%
export const MIN_SLIPPAGE_BPS = 0 // 0%
export const HIGH_SLIPPAGE_BPS = 100 // 1%
export const LOW_SLIPPAGE_BPS = 5 // 0.05%
export const INITIAL_ALLOWED_SLIPPAGE_PERCENT = new Percent(DEFAULT_SLIPPAGE_BPS, 10_000) // 0.5%
export const RADIX_DECIMAL = 10
export const RADIX_HEX = 16

export const AMOUNT_PRECISION = 4
export const LONG_PRECISION = 10
export const FULL_PRICE_PRECISION = 20
export const FIAT_PRECISION = 2
export const PERCENTAGE_PRECISION = 2

export const LONG_LOAD_THRESHOLD = 2000

export const AVG_APPROVE_COST_GWEI = '50000'
export const DEFAULT_APP_CODE = 'CoW Swap'
export const SAFE_APP_CODE = `${DEFAULT_APP_CODE}-SafeApp`

export const APP_TITLE = msg`CoW Swap | The smartest way to trade cryptocurrencies`

export const PAGE_TITLES = {
  SWAP: msg`Swap`,
  LIMIT_ORDERS: msg`Limit Orders`,
  YIELD: msg`Yield`,
  ADVANCED: msg`TWAP`,
  ACCOUNT_OVERVIEW: msg`Account Overview`,
  TOKENS_OVERVIEW: msg`Tokens Overview`,
  COW_RUNNER: msg`CoW Runner`,
  MEV_SLICER: msg`Mev Slicer`,
  HOOKS: msg`Hooks`,
}

export function getEthFlowContractAddresses(env: CowEnv, chainId: SupportedChainId): string {
  return env === 'prod' ? ETH_FLOW_ADDRESSES[chainId] : BARN_ETH_FLOW_ADDRESSES[chainId]
}

export const V_COW_CONTRACT_ADDRESS: Record<SupportedChainId, string | null> = {
  ...mapSupportedNetworks(null),
  [SupportedChainId.MAINNET]: '0xd057b63f5e69cf1b929b356b579cba08d7688048',
  [SupportedChainId.GNOSIS_CHAIN]: '0xc20C9C13E853fc64d054b73fF21d3636B2d97eaB',
  [SupportedChainId.SEPOLIA]: '0x21d06a222bbb94ec1406a0a8ba86b4d761bc9864',
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
  [SupportedChainId.LENS]: null,
  [SupportedChainId.BNB]: null, // TODO: add BNB COW token address when available
  [SupportedChainId.LINEA]: null,
  [SupportedChainId.PLASMA]: null,
}

// Explorer (TODO: reuse the CowSwap msg`` strings below when the explorer is localized
export const RECEIVED_LABEL_EXPLORER = 'Received'
export const ACCOUNT_PROXY_LABEL_EXPLORER = 'Account Proxy'

// CowSwap
export const RECEIVED_LABEL = msg`Received`
export const ACCOUNT_PROXY_LABEL = msg`Account Proxy`
export const INPUT_OUTPUT_EXPLANATION = msg`Only executed swaps incur fees.`

export const PENDING_ORDERS_BUFFER = ms`60s` // 60s
export const CANCELLED_ORDERS_PENDING_TIME = ms`5min` // 5min
export const PRICE_API_TIMEOUT_MS = ms`10s` // 10s
export const ORDER_BOOK_API_UPDATE_INTERVAL = ms`30s` // 30s
export const MINIMUM_ORDER_VALID_TO_TIME_SECONDS = 120
// Minimum deadline for EthFlow orders. Like the default deadline, anything smaller will be replaced by this
export const MINIMUM_ETH_FLOW_DEADLINE_SECONDS = 600 // 10 minutes in SECONDS

export const MINIMUM_ETH_FLOW_SLIPPAGE_BPS = DEFAULT_SLIPPAGE_BPS

export const ETH_FLOW_SLIPPAGE_WARNING_THRESHOLD: Record<SupportedChainId, number> = mapSupportedNetworks(
  200, // 2%
)

export const MINIMUM_ETH_FLOW_SLIPPAGE = new Percent(DEFAULT_SLIPPAGE_BPS, 10_000)

export const HIGH_ETH_FLOW_SLIPPAGE_BPS = 1_000 // 10%

const GITHUB_REPOSITORY = 'cowprotocol/cowswap'
export const CODE_LINK = 'https://github.com/' + GITHUB_REPOSITORY
export const RAW_CODE_LINK = 'https://raw.githubusercontent.com/' + GITHUB_REPOSITORY

export const COW_PROTOCOL_LINK = 'https://cow.fi'
export const COWDAO_KNOWLEDGE_BASE_LINK = 'https://cow.fi/learn'
export const COWDAO_LEGAL_LINK = 'https://cow.fi/legal'
export const COWDAO_COWSWAP_ABOUT_LINK = 'https://cow.fi/cow-swap'
export const DOCS_LINK = 'https://docs.cow.fi'
export const DISCORD_LINK = 'https://discord.com/invite/cowprotocol'
export const DUNE_DASHBOARD_LINK = 'https://dune.com/cowprotocol/cowswap'
export const TWITTER_LINK = 'https://twitter.com/CoWSwap'

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
  [SupportedChainId.LENS]: 'https://api.blocknative.com/gasprices/blockprices?chainid=232',
  [SupportedChainId.BNB]: 'https://api.blocknative.com/gasprices/blockprices?chainid=56',
  [SupportedChainId.LINEA]: 'https://api.blocknative.com/gasprices/blockprices?chainid=59144',
  [SupportedChainId.PLASMA]: '', // TODO: currently (2025/10/20) unsupported by Blocknative nor blockscont
}
export const GAS_API_KEYS: Record<SupportedChainId, string | null> = {
  [SupportedChainId.MAINNET]: process.env.REACT_APP_BLOCKNATIVE_API_KEY || null,
  [SupportedChainId.GNOSIS_CHAIN]: null,
  [SupportedChainId.ARBITRUM_ONE]: null,
  [SupportedChainId.BASE]: null,
  [SupportedChainId.SEPOLIA]: null,
  [SupportedChainId.POLYGON]: null,
  [SupportedChainId.AVALANCHE]: process.env.REACT_APP_BLOCKNATIVE_API_KEY || null,
  [SupportedChainId.LENS]: process.env.REACT_APP_BLOCKNATIVE_API_KEY || null,
  [SupportedChainId.BNB]: process.env.REACT_APP_BLOCKNATIVE_API_KEY || null,
  [SupportedChainId.LINEA]: process.env.REACT_APP_BLOCKNATIVE_API_KEY || null,
  [SupportedChainId.PLASMA]: null,
}

export const UNSUPPORTED_TOKENS_FAQ_URL = 'https://docs.cow.fi/cow-protocol/reference/core/tokens'

// fee threshold - should be greater than percentage, show warning
export const FEE_SIZE_THRESHOLD = 10 // 10%

export const MAXIMUM_ORDERS_TO_DISPLAY = 10
export const AMOUNT_OF_ORDERS_TO_FETCH = 100

// Start date of COW vesting for locked GNO
export const LOCKED_GNO_VESTING_START_DATE = new Date('02-11-2022 13:05:15 GMT')

// These values match the vesting contract configuration (see contract's `cliffTime` and `duration` fields).
// They are fixed and will never change.
export const LOCKED_GNO_VESTING_START_TIME = 1644584715000
export const LOCKED_GNO_VESTING_DURATION = 126144000000 // 4 years

export const SWR_NO_REFRESH_OPTIONS = {
  // Cache indefinitely
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  refreshInterval: 0,
}

// Min USD value to show surplus
export const MIN_FIAT_SURPLUS_VALUE = 0.01

// Min FIAT value for displaying the surplus modal
export const MIN_FIAT_SURPLUS_VALUE_MODAL = 1

// Min surplus value in units for displaying the surplus modal when FIAT value is not available
export const MIN_SURPLUS_UNITS = 0.01
