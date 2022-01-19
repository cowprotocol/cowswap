import { Token, Fraction, Percent } from '@uniswap/sdk-core'

import { GPv2Settlement, GPv2VaultRelayer } from '@gnosis.pm/gp-v2-contracts/networks.json'
import { WalletInfo, SUPPORTED_WALLETS as SUPPORTED_WALLETS_UNISWAP } from 'constants/wallet'

import { SupportedChainId as ChainId } from 'constants/chains'
import { getAppDataHash } from './appDataHash'

export const INITIAL_ALLOWED_SLIPPAGE_PERCENT = new Percent('5', '1000') // 0.5%
export const RADIX_DECIMAL = 10
export const RADIX_HEX = 16

// TODO: remove, this is duplicated with `import { ONE_HUNDRED_PERCENT } from 'constants/misc'`
export const ONE_HUNDRED_PERCENT = new Percent(1, 1)

export const DEFAULT_DECIMALS = 18
export const DEFAULT_PRECISION = 6
export const DEFAULT_SMALL_LIMIT = '0.000001'
export const AMOUNT_PRECISION = 4
export const LONG_PRECISION = 10
export const FULL_PRICE_PRECISION = 20
export const FIAT_PRECISION = 2
export const PERCENTAGE_PRECISION = 2

export const LONG_LOAD_THRESHOLD = 2000

export const APP_DATA_HASH = getAppDataHash()
export const PRODUCTION_URL = 'cowswap.exchange'
export const BARN_URL = `barn.${PRODUCTION_URL}`

const DISABLED_WALLETS = /^(?:WALLET_LINK|COINBASE_LINK|FORTMATIC|Portis)$/i

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

export const V_COW_CONTRACT_ADDRESS: Partial<Record<number, string>> = {
  // TODO: load addresses from contract package when available
  // [ChainId.MAINNET]: GPv2Settlement[ChainId.MAINNET].address,
  // [ChainId.RINKEBY]: GPv2Settlement[ChainId.RINKEBY].address,
  // [ChainId.XDAI]: GPv2Settlement[ChainId.XDAI].address,
  [ChainId.RINKEBY]: '0xB26D8c5D3d0A67F419F7b314D462C8357Cd4b122',
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

// 0.1 balance threshold
export const LOW_NATIVE_BALANCE_THRESHOLD = new Fraction('1', '10')
export const DOCS_LINK = 'https://docs.cow.fi'
export const CONTRACTS_CODE_LINK = 'https://github.com/gnosis/gp-v2-contracts'
export const CODE_LINK = 'https://github.com/gnosis/gp-swap-ui'
export const DISCORD_LINK = 'https://chat.cowswap.exchange'
export const DUNE_DASHBOARD_LINK = 'https://duneanalytics.com/gnosis.protocol/Gnosis-Protocol-V2'
export const TWITTER_LINK = 'https://twitter.com/mevprotection'

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
  // TODO: xdai? = main
  [ChainId.XDAI]: 'https://safe-relay.gnosis.io/api/v1/gas-station/',
}

export const UNSUPPORTED_TOKENS_FAQ_URL = '/faq#what-token-pairs-does-cowswap-allow-to-trade'

// fee threshold - should be greater than percentage, show warning
export const FEE_SIZE_THRESHOLD = new Fraction(10, 100) // 30%

// default value provided as userAddress to Paraswap API if the user wallet is not connected
export const SOLVER_ADDRESS = '0xa6ddbd0de6b310819b49f680f65871bee85f517e'

export const MAXIMUM_ORDERS_TO_DISPLAY = 10
export const AMOUNT_OF_ORDERS_TO_FETCH = 100

// last wallet provider key used in local storage
export const STORAGE_KEY_LAST_PROVIDER = 'lastProvider'

// Default price strategy to use for getting app prices
// COWSWAP = new quote endpoint
// LEGACY = price racing logic (checking 0x, gp, paraswap, etc)
export const DEFAULT_GP_PRICE_STRATEGY = 'COWSWAP'
