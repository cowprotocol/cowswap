import { Token, Fraction, Percent } from '@uniswap/sdk-core'

import { GPv2Settlement, GPv2AllowanceManager } from '@gnosis.pm/gp-v2-contracts/networks.json'
import {
  INITIAL_ALLOWED_SLIPPAGE,
  SUPPORTED_WALLETS as SUPPORTED_WALLETS_UNISWAP,
  WalletInfo,
} from '@src/constants/index'

import JSBI from 'jsbi'
import { SupportedChainId as ChainId } from 'constants/chains'

export const INITIAL_ALLOWED_SLIPPAGE_PERCENT = new Percent(JSBI.BigInt(INITIAL_ALLOWED_SLIPPAGE), JSBI.BigInt(10000))
export const RADIX_DECIMAL = 10
export const RADIX_HEX = 16

export const DEFAULT_DECIMALS = 18
export const DEFAULT_PRECISION = 6
export const SHORT_PRECISION = 4
export const SHORTEST_PRECISION = 3
export const LONG_PRECISION = 10
export const FIAT_PRECISION = 2
export const PERCENTAGE_PRECISION = 2

export const LONG_LOAD_THRESHOLD = 2000

export const APP_ID = Number(process.env.REACT_APP_ID)

// reexport all Uniswap constants everything
export * from '@src/constants/index'

export const PRODUCTION_URL = 'cowswap.exchange'

const DISABLED_WALLETS = /^(?:WALLET_LINK|COINBASE_LINK|FORTMATIC|Portis)$/i

// Re-export only the supported wallets
export const SUPPORTED_WALLETS = Object.keys(SUPPORTED_WALLETS_UNISWAP).reduce((acc, key) => {
  if (!DISABLED_WALLETS.test(key)) {
    acc[key] = SUPPORTED_WALLETS_UNISWAP[key]
  }
  return acc
}, {} as { [key: string]: WalletInfo })

// Smart contract wallets are filtered out by default, no need to add them to this list
export const UNSUPPORTED_WC_WALLETS = new Set(['DeFi Wallet', '1inch Wallet', 'Pillar Wallet', 'WallETH'])

// TODO: When contracts are deployed, we can load this from the NPM package
export const GP_SETTLEMENT_CONTRACT_ADDRESS: Partial<Record<number, string>> = {
  [ChainId.MAINNET]: GPv2Settlement[ChainId.MAINNET].address,
  [ChainId.RINKEBY]: GPv2Settlement[ChainId.RINKEBY].address,
  [ChainId.XDAI]: GPv2Settlement[ChainId.XDAI].address,
}

export const GP_ALLOWANCE_MANAGER_CONTRACT_ADDRESS: Partial<Record<number, string>> = {
  [ChainId.MAINNET]: GPv2AllowanceManager[ChainId.MAINNET].address,
  [ChainId.RINKEBY]: GPv2AllowanceManager[ChainId.RINKEBY].address,
  [ChainId.XDAI]: GPv2AllowanceManager[ChainId.XDAI].address,
}

// See https://github.com/gnosis/gp-v2-contracts/commit/821b5a8da213297b0f7f1d8b17c893c5627020af#diff-12bbbe13cd5cf42d639e34a39d8795021ba40d3ee1e1a8282df652eb161a11d6R13
export const BUY_ETHER_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
export const BUY_ETHER_TOKEN: { [chainId in ChainId]: Token } = {
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, BUY_ETHER_ADDRESS, 18, 'ETH', 'Ether'),
  [ChainId.RINKEBY]: new Token(ChainId.RINKEBY, BUY_ETHER_ADDRESS, 18, 'ETH', 'Ether'),
  [ChainId.ROPSTEN]: new Token(ChainId.ROPSTEN, BUY_ETHER_ADDRESS, 18, 'ETH', 'Ether'),
  [ChainId.GOERLI]: new Token(ChainId.GOERLI, BUY_ETHER_ADDRESS, 18, 'ETH', 'Ether'),
  [ChainId.KOVAN]: new Token(ChainId.KOVAN, BUY_ETHER_ADDRESS, 18, 'ETH', 'Ether'),
  [ChainId.XDAI]: new Token(ChainId.XDAI, BUY_ETHER_ADDRESS, 18, 'xDAI', 'xDAI'),
}

export const ORDER_ID_SHORT_LENGTH = 8
export const INPUT_OUTPUT_EXPLANATION = 'Only executed swaps incur fees.'
export const DEFAULT_ORDER_DELAY = 20000 // 20s
export const PENDING_ORDERS_BUFFER = 60 * 1000 // 60s
export const CANCELLED_ORDERS_PENDING_TIME = 5 * 60 * 1000 // 5min
export const PRICE_API_TIMEOUT_MS = 10000 // 10s
export const EXPIRED_ORDERS_BUFFER = 45 * 1000 // 45s
export const CHECK_EXPIRED_ORDERS_INTERVAL = 10000 // 10 sec

export const WETH_LOGO_URI =
  'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
export const XDAI_LOGO_URI =
  'https://raw.githubusercontent.com/1Hive/default-token-list/master/src/assets/xdai/0xe91d153e0b41518a2ce8dd3d7944fa863463a97d/logo.png'

// 0.1 balance threshold
export const LOW_NATIVE_BALANCE_THRESHOLD = new Fraction('1', '10')
export const CONTRACTS_CODE_LINK = 'https://github.com/gnosis/gp-v2-contracts'
export const CODE_LINK = 'https://github.com/gnosis/gp-swap-ui'
export const DISCORD_LINK = 'https://chat.cowswap.exchange'
export const DUNE_DASHBOARD_LINK = 'https://duneanalytics.com/gnosis.protocol/Gnosis-Protocol-V2'

// 30 minutes
export const GAS_PRICE_UPDATE_THRESHOLD = 30 * 60 * 1000
export const GAS_FEE_ENDPOINTS = {
  [ChainId.MAINNET]: 'https://safe-relay.gnosis.io/api/v1/gas-station/',
  // No ropsten = main
  [ChainId.ROPSTEN]: 'https://safe-relay.gnosis.io/api/v1/gas-station/',
  [ChainId.RINKEBY]: 'https://safe-relay.rinkeby.gnosis.io/api/v1/gas-station/',
  [ChainId.GOERLI]: 'https://safe-relay.goerli.gnosis.io/api/v1/gas-station/',
  // no kovan = main
  [ChainId.KOVAN]: 'https://safe-relay.kovan.gnosis.io/api/v1/gas-station/',
  // TODO: xdai? = main
  [ChainId.XDAI]: 'https://safe-relay.gnosis.io/api/v1/gas-station/',
}

export const UNSUPPORTED_TOKENS_FAQ_URL = '/faq#what-token-pairs-does-cowswap-allow-to-trade'
