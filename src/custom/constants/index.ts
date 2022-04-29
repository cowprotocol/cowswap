import { Token, Fraction, Percent } from '@uniswap/sdk-core'

import { GPv2Settlement, GPv2VaultRelayer } from '@gnosis.pm/gp-v2-contracts/networks.json'
import { WalletInfo, SUPPORTED_WALLETS as SUPPORTED_WALLETS_UNISWAP } from 'constants/wallet'

import { SupportedChainId as ChainId } from 'constants/chains'
import { getAppDataHash } from './appDataHash'

export const INITIAL_ALLOWED_SLIPPAGE_PERCENT = new Percent('5', '1000') // 0.5%
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

export const APP_DATA_HASH = getAppDataHash()
export const PRODUCTION_URL = 'cowswap.exchange'
export const BARN_URL = `barn.${PRODUCTION_URL}`

// Allow WALLET_LINK to be activated on mobile
// since COINBASE_LINK is limited to use only 1 deeplink on mobile
SUPPORTED_WALLETS_UNISWAP.WALLET_LINK = {
  ...SUPPORTED_WALLETS_UNISWAP.WALLET_LINK,
  mobile: true,
}
const DISABLED_WALLETS = /^(?:Portis|COINBASE_LINK)$/i

// Re-export only the supported wallets
export const SUPPORTED_WALLETS = Object.keys(SUPPORTED_WALLETS_UNISWAP).reduce((acc, key) => {
  if (!DISABLED_WALLETS.test(key)) {
    acc[key] = SUPPORTED_WALLETS_UNISWAP[key]
  }
  return acc
}, {} as { [key: string]: WalletInfo })

// Smart contract wallets are filtered out by default, no need to add them to this list
export const UNSUPPORTED_WC_WALLETS = new Set(['DeFi Wallet', 'WallETH'])

export const GP_SETTLEMENT_CONTRACT_ADDRESS: Partial<Record<number, string>> = {
  [ChainId.MAINNET]: GPv2Settlement[ChainId.MAINNET].address,
  [ChainId.RINKEBY]: GPv2Settlement[ChainId.RINKEBY].address,
  [ChainId.XDAI]: GPv2Settlement[ChainId.XDAI].address,
}

export const GP_VAULT_RELAYER: Partial<Record<number, string>> = {
  [ChainId.MAINNET]: GPv2VaultRelayer[ChainId.MAINNET].address,
  [ChainId.RINKEBY]: GPv2VaultRelayer[ChainId.RINKEBY].address,
  [ChainId.XDAI]: GPv2VaultRelayer[ChainId.XDAI].address,
}

export const V_COW_CONTRACT_ADDRESS: Record<number, string> = {
  [ChainId.MAINNET]: '0xd057b63f5e69cf1b929b356b579cba08d7688048',
  [ChainId.XDAI]: '0xc20C9C13E853fc64d054b73fF21d3636B2d97eaB',
  [ChainId.RINKEBY]: '0x9386177e95A853070076Df2403b9D547D653126D',
}

export const COW_CONTRACT_ADDRESS: Record<number, string> = {
  [ChainId.MAINNET]: '0xDEf1CA1fb7FBcDC777520aa7f396b4E015F497aB',
  [ChainId.XDAI]: '0x177127622c4A00F3d409B75571e12cB3c8973d3c',
  [ChainId.RINKEBY]: '0xbdf1e19f8c78A77fb741b44EbA5e4c0C8DBAeF91',
}

// See https://github.com/gnosis/gp-v2-contracts/commit/821b5a8da213297b0f7f1d8b17c893c5627020af#diff-12bbbe13cd5cf42d639e34a39d8795021ba40d3ee1e1a8282df652eb161a11d6R13
export const NATIVE_CURRENCY_BUY_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
export const NATIVE_CURRENCY_BUY_TOKEN: { [chainId in ChainId | number]: Token } = {
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, NATIVE_CURRENCY_BUY_ADDRESS, 18, 'ETH', 'Ether'),
  [ChainId.RINKEBY]: new Token(ChainId.RINKEBY, NATIVE_CURRENCY_BUY_ADDRESS, 18, 'ETH', 'Ether'),
  // [ChainId.ROPSTEN]: new Token(ChainId.ROPSTEN, NATIVE_CURRENCY_BUY_ADDRESS, 18, 'ETH', 'Ether'),
  // [ChainId.GOERLI]: new Token(ChainId.GOERLI, NATIVE_CURRENCY_BUY_ADDRESS, 18, 'ETH', 'Ether'),
  // [ChainId.KOVAN]: new Token(ChainId.KOVAN, NATIVE_CURRENCY_BUY_ADDRESS, 18, 'ETH', 'Ether'),
  [ChainId.XDAI]: new Token(ChainId.XDAI, NATIVE_CURRENCY_BUY_ADDRESS, 18, 'xDAI', 'xDAI'),
}

export const ORDER_ID_SHORT_LENGTH = 8
export const INPUT_OUTPUT_EXPLANATION = 'Only executed swaps incur fees.'
export const DEFAULT_ORDER_DELAY = 20000 // 20s
export const PENDING_ORDERS_BUFFER = 60 * 1000 // 60s
export const CANCELLED_ORDERS_PENDING_TIME = 5 * 60 * 1000 // 5min
export const PRICE_API_TIMEOUT_MS = 10000 // 10s
export const GP_ORDER_UPDATE_INTERVAL = 30 * 1000 // 30s
export const MINIMUM_ORDER_VALID_TO_TIME_SECONDS = 120

export const WETH_LOGO_URI =
  'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
export const XDAI_LOGO_URI =
  'https://raw.githubusercontent.com/1Hive/default-token-list/master/src/assets/xdai/0xe91d153e0b41518a2ce8dd3d7944fa863463a97d/logo.png'

export const DOCS_LINK = 'https://docs.cow.fi'
export const CONTRACTS_CODE_LINK = 'https://github.com/gnosis/gp-v2-contracts'
export const CODE_LINK = 'https://github.com/cowprotocol/cowswap'
export const DISCORD_LINK = 'https://discord.com/invite/cowprotocol'
export const DUNE_DASHBOARD_LINK = 'https://duneanalytics.com/gnosis.protocol/Gnosis-Protocol-V2'
export const TWITTER_LINK = 'https://twitter.com/mevprotection'
export const GPAUDIT_LINK = 'https://github.com/gnosis/gp-v2-contracts/blob/main/audits/GnosisProtocolV2May2021.pdf'
export const FLASHBOYS_LINK = 'https://arxiv.org/abs/1904.05234'
export const COWWIKI_LINK = 'https://en.wikipedia.org/wiki/Coincidence_of_wants'
export const GNOSIS_FORUM_ROADTODECENT_LINK = 'https://forum.gnosis.io/t/gpv2-road-to-decentralization/1245'

// MEV Metrics from https://explore.flashbots.net/
export const MEV_TOTAL = '606 Million'
export const FLASHBOTS_LINK = 'https://explore.flashbots.net/'

// 30 minutes
export const GAS_PRICE_UPDATE_THRESHOLD = 30 * 60 * 1000
export const GAS_FEE_ENDPOINTS = {
  [ChainId.MAINNET]: 'https://safe-relay.gnosis.io/api/v1/gas-station/',
  // No ropsten = main
  // [ChainId.ROPSTEN]: 'https://safe-relay.gnosis.io/api/v1/gas-station/',
  [ChainId.RINKEBY]: 'https://safe-relay.rinkeby.gnosis.io/api/v1/gas-station/',
  // [ChainId.GOERLI]: 'https://safe-relay.goerli.gnosis.io/api/v1/gas-station/',
  // no kovan = main
  // [ChainId.KOVAN]: 'https://safe-relay.kovan.gnosis.io/api/v1/gas-station/',
  [ChainId.XDAI]: 'https://blockscout.com/xdai/mainnet/api/v1/gas-price-oracle',
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
