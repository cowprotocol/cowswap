import { ChainId } from '@uniswap/sdk'
import { WETH9, Token } from '@uniswap/sdk-core'
import { DAI_RINKEBY, USDC_RINKEBY, USDT_RINKEBY, WBTC_RINKEBY } from 'utils/rinkeby/constants'
import { DAI, USDC as USDC_MAINNET, USDT, WBTC } from '@src/constants/tokens'
import { USDC_XDAI, /*USDT_XDAI,*/ WBTC_XDAI, WETH_XDAI, WXDAI } from 'utils/xdai/constants'
import { SupportedChainId } from 'constants/chains'
import { V_COW_CONTRACT_ADDRESS, COW_CONTRACT_ADDRESS } from 'constants/index'

import wxDaiLogo from 'assets/cow-swap/wxdai.png'
import vCowLogo from 'assets/cow-swap/cow.svg'
import gnoLogo from 'assets/cow-swap/gno.png'
import usdcLogo from 'assets/cow-swap/usdc.png'

export * from './tokensMod'

function getTrustImage(mainnetAddress: string): string {
  return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${mainnetAddress}/logo.png`
}

const WETH_ADDRESS_MAINNET = WETH9[ChainId.MAINNET].address

/**
 * vCow token
 */
const V_COW_TOKEN_MAINNET = new Token(
  SupportedChainId.MAINNET,
  V_COW_CONTRACT_ADDRESS[SupportedChainId.MAINNET] || '',
  18,
  'vCOW',
  'CoW Protocol Virtual Token'
)

const V_COW_TOKEN_XDAI = new Token(
  SupportedChainId.XDAI,
  V_COW_CONTRACT_ADDRESS[SupportedChainId.XDAI] || '',
  18,
  'vCOW',
  'CoW Protocol Virtual Token'
)

const V_COW_TOKEN_RINKEBY = new Token(
  SupportedChainId.RINKEBY,
  V_COW_CONTRACT_ADDRESS[SupportedChainId.RINKEBY] || '',
  18,
  'vCOW',
  'CoW Protocol Virtual Token'
)

export const V_COW: Record<number, Token> = {
  [SupportedChainId.MAINNET]: V_COW_TOKEN_MAINNET,
  [SupportedChainId.XDAI]: V_COW_TOKEN_XDAI,
  [SupportedChainId.RINKEBY]: V_COW_TOKEN_RINKEBY,
}

/**
 * Cow token
 */
const COW_TOKEN_MAINNET = new Token(
  SupportedChainId.MAINNET,
  COW_CONTRACT_ADDRESS[SupportedChainId.MAINNET] || '',
  18,
  'COW',
  'CoW Protocol Token'
)

const COW_TOKEN_XDAI = new Token(
  SupportedChainId.XDAI,
  COW_CONTRACT_ADDRESS[SupportedChainId.XDAI] || '',
  18,
  'COW',
  'CoW Protocol Token'
)

const COW_TOKEN_RINKEBY = new Token(
  SupportedChainId.RINKEBY,
  COW_CONTRACT_ADDRESS[SupportedChainId.RINKEBY] || '',
  18,
  'COW',
  'CoW Protocol Token'
)

export const COW: Record<number, Token> = {
  [SupportedChainId.MAINNET]: COW_TOKEN_MAINNET,
  [SupportedChainId.XDAI]: COW_TOKEN_XDAI,
  [SupportedChainId.RINKEBY]: COW_TOKEN_RINKEBY,
}

/**
 * GNO token
 */
const GNO_MAINNET = new Token(
  SupportedChainId.MAINNET,
  '0x6810e776880c02933d47db1b9fc05908e5386b96',
  18,
  'GNO',
  'Gnosis'
)
const GNO_XDAI = new Token(SupportedChainId.XDAI, '0x9c58bacc331c9aa871afd802db6379a98e80cedb', 18, 'GNO', 'Gnosis')
const GNO_RINKEBY = new Token(
  SupportedChainId.RINKEBY,
  '0xd0dab4e640d95e9e8a47545598c33e31bdb53c7c',
  18,
  'GNO',
  'Gnosis'
)

export const GNO: Record<SupportedChainId, Token> = {
  [SupportedChainId.MAINNET]: GNO_MAINNET,
  [SupportedChainId.XDAI]: GNO_XDAI,
  [SupportedChainId.RINKEBY]: GNO_RINKEBY,
}

/**
 * USDC token
 */
export const USDC_BY_CHAIN: Record<SupportedChainId, Token> = {
  [SupportedChainId.MAINNET]: USDC_MAINNET,
  [SupportedChainId.XDAI]: USDC_XDAI,
  [SupportedChainId.RINKEBY]: USDC_RINKEBY,
}

export const ADDRESS_IMAGE_OVERRIDE = {
  // Rinkeby
  [DAI_RINKEBY.address]: getTrustImage(DAI.address),
  [USDC_RINKEBY.address]: getTrustImage(USDC_MAINNET.address),
  [USDT_RINKEBY.address]: getTrustImage(USDT.address),
  [WBTC_RINKEBY.address]: getTrustImage(WBTC.address),
  [WETH9[ChainId.RINKEBY].address]: getTrustImage(WETH_ADDRESS_MAINNET),
  [V_COW_TOKEN_RINKEBY.address]: vCowLogo,
  [GNO_RINKEBY.address]: gnoLogo,
  [USDC_RINKEBY.address]: usdcLogo,
  // xDai
  [USDC_XDAI.address]: getTrustImage(USDC_MAINNET.address),
  // [USDT_XDAI.address]: getTrustImage(USDT.address),
  [WBTC_XDAI.address]: getTrustImage(WBTC.address),
  [WXDAI.address]: wxDaiLogo,
  [WETH_XDAI.address]: getTrustImage(WETH_ADDRESS_MAINNET),
  [V_COW_TOKEN_XDAI.address]: vCowLogo,
  [GNO_XDAI.address]: gnoLogo,
  [USDC_XDAI.address]: usdcLogo,
  // Mainnet
  [V_COW_TOKEN_MAINNET.address]: vCowLogo,
}
