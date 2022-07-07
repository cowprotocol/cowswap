import { SupportedChainId as ChainId } from 'constants/chains'
import { WETH9, Token } from '@uniswap/sdk-core'
import { DAI_RINKEBY, USDC_RINKEBY, USDT_RINKEBY, WBTC_RINKEBY } from 'utils/rinkeby/constants'
import { DAI, USDC_MAINNET, USDT, WBTC } from '@src/constants/tokens'
import {
  USDC_GNOSIS_CHAIN,
  /*USDT_GNOSIS_CHAIN,*/ WBTC_GNOSIS_CHAIN,
  WETH_GNOSIS_CHAIN,
  WXDAI,
} from 'utils/gnosis_chain/constants'
import { SupportedChainId } from 'constants/chains'
import { V_COW_CONTRACT_ADDRESS, COW_CONTRACT_ADDRESS } from 'constants/index'

import wxDaiLogo from 'assets/cow-swap/wxdai.png'
// TODO: these are the same? why?
import vCowLogo from 'assets/cow-swap/vCOW.png'
import cowLogo from 'assets/cow-swap/cow.svg'
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
  SupportedChainId.GNOSIS_CHAIN,
  V_COW_CONTRACT_ADDRESS[SupportedChainId.GNOSIS_CHAIN] || '',
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
  [SupportedChainId.GNOSIS_CHAIN]: V_COW_TOKEN_XDAI,
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
  SupportedChainId.GNOSIS_CHAIN,
  COW_CONTRACT_ADDRESS[SupportedChainId.GNOSIS_CHAIN] || '',
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
  [SupportedChainId.GNOSIS_CHAIN]: COW_TOKEN_XDAI,
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
const GNO_GNOSIS_CHAIN = new Token(
  SupportedChainId.GNOSIS_CHAIN,
  '0x9c58bacc331c9aa871afd802db6379a98e80cedb',
  18,
  'GNO',
  'Gnosis'
)
const GNO_RINKEBY = new Token(
  SupportedChainId.RINKEBY,
  '0xd0dab4e640d95e9e8a47545598c33e31bdb53c7c',
  18,
  'GNO',
  'Gnosis'
)

export const GNO: Record<SupportedChainId, Token> = {
  [SupportedChainId.MAINNET]: GNO_MAINNET,
  [SupportedChainId.GNOSIS_CHAIN]: GNO_GNOSIS_CHAIN,
  [SupportedChainId.RINKEBY]: GNO_RINKEBY,
}

export const ADDRESS_IMAGE_OVERRIDE = {
  // Rinkeby
  [DAI_RINKEBY.address]: getTrustImage(DAI.address),
  [USDC_RINKEBY.address]: getTrustImage(USDC_MAINNET.address),
  [USDT_RINKEBY.address]: getTrustImage(USDT.address),
  [WBTC_RINKEBY.address]: getTrustImage(WBTC.address),
  [WETH9[ChainId.RINKEBY].address]: getTrustImage(WETH_ADDRESS_MAINNET),
  [V_COW_TOKEN_RINKEBY.address]: vCowLogo,
  [COW_TOKEN_RINKEBY.address]: cowLogo,
  [GNO_RINKEBY.address]: gnoLogo,
  [USDC_RINKEBY.address]: usdcLogo,
  // xDai
  [USDC_GNOSIS_CHAIN.address]: getTrustImage(USDC_MAINNET.address),
  // [USDT_GNOSIS_CHAIN.address]: getTrustImage(USDT.address),
  [WBTC_GNOSIS_CHAIN.address]: getTrustImage(WBTC.address),
  [WXDAI.address]: wxDaiLogo,
  [WETH_GNOSIS_CHAIN.address]: getTrustImage(WETH_ADDRESS_MAINNET),
  [V_COW_TOKEN_XDAI.address]: vCowLogo,
  [COW_TOKEN_XDAI.address]: cowLogo,
  [GNO_GNOSIS_CHAIN.address]: gnoLogo,
  [USDC_GNOSIS_CHAIN.address]: usdcLogo,
  // Mainnet
  [V_COW_TOKEN_MAINNET.address]: vCowLogo,
  [COW_TOKEN_MAINNET.address]: cowLogo,
}

/**
 * Addresses related to COW vesting for Locked GNO
 * These are used in src/custom/pages/Account/LockedGnoVesting hooks and index files
 */
export const MERKLE_DROP_CONTRACT_ADDRESSES: Record<number, string> = {
  [SupportedChainId.MAINNET]: '0x64646f112FfD6F1B7533359CFaAF7998F23C8c40',
  [SupportedChainId.RINKEBY]: '0x5444c4AFb2ec7f7367C10F7732b8558650c5899F',
  [SupportedChainId.GNOSIS_CHAIN]: '0x48D8566887F8c7d99757CE29c2cD39962bfd9547',
}

export const TOKEN_DISTRO_CONTRACT_ADDRESSES: Record<number, string> = {
  [SupportedChainId.MAINNET]: '0x68FFAaC7A431f276fe73604C127Bd78E49070c92',
  [SupportedChainId.RINKEBY]: '0xeBA8CE5b23c054f1511F8fF5114d848329B8258d',
  [SupportedChainId.GNOSIS_CHAIN]: '0x3d610e917130f9D036e85A030596807f57e11093',
}
