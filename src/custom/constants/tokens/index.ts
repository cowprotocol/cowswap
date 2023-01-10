import { SupportedChainId as ChainId } from 'constants/chains'
import { WETH9, Token } from '@uniswap/sdk-core'
import { DAI_GOERLI, USDC_GOERLI, USDT_GOERLI, WBTC_GOERLI } from 'utils/goerli/constants'
import { DAI, USDC_MAINNET, USDT, WBTC } from '@src/constants/tokens'
import { USDC_GNOSIS_CHAIN, WBTC_GNOSIS_CHAIN, WETH_GNOSIS_CHAIN, WXDAI } from 'utils/gnosis_chain/constants'
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

const V_COW_TOKEN_GOERLI = new Token(
  SupportedChainId.GOERLI,
  V_COW_CONTRACT_ADDRESS[SupportedChainId.GOERLI] || '',
  18,
  'vCOW',
  'CoW Protocol Virtual Token'
)

export const V_COW: Record<number, Token> = {
  [SupportedChainId.MAINNET]: V_COW_TOKEN_MAINNET,
  [SupportedChainId.GNOSIS_CHAIN]: V_COW_TOKEN_XDAI,
  [SupportedChainId.GOERLI]: V_COW_TOKEN_GOERLI,
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

const COW_TOKEN_GOERLI = new Token(
  SupportedChainId.GOERLI,
  COW_CONTRACT_ADDRESS[SupportedChainId.GOERLI] || '',
  18,
  'COW',
  'CoW Protocol Token'
)

export const COW: Record<number, Token> = {
  [SupportedChainId.MAINNET]: COW_TOKEN_MAINNET,
  [SupportedChainId.GNOSIS_CHAIN]: COW_TOKEN_XDAI,
  [SupportedChainId.GOERLI]: COW_TOKEN_GOERLI,
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

const GNO_GOERLI = new Token(SupportedChainId.GOERLI, '0x02abbdbaaa7b1bb64b5c878f7ac17f8dda169532', 18, 'GNO', 'Gnosis')

export const GNO: Record<SupportedChainId, Token> = {
  [SupportedChainId.MAINNET]: GNO_MAINNET,
  [SupportedChainId.GNOSIS_CHAIN]: GNO_GNOSIS_CHAIN,
  [SupportedChainId.GOERLI]: GNO_GOERLI,
}

export const ADDRESS_IMAGE_OVERRIDE = {
  // Goerli
  [DAI_GOERLI.address]: getTrustImage(DAI.address),
  [USDC_GOERLI.address]: getTrustImage(USDC_MAINNET.address),
  [USDT_GOERLI.address]: getTrustImage(USDT.address),
  [WBTC_GOERLI.address]: getTrustImage(WBTC.address),
  [WETH9[ChainId.GOERLI].address]: getTrustImage(WETH_ADDRESS_MAINNET),
  [V_COW_TOKEN_GOERLI.address]: vCowLogo,
  [COW_TOKEN_GOERLI.address]: cowLogo,
  [GNO_GOERLI.address]: gnoLogo,
  [USDC_GOERLI.address]: usdcLogo,
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
  [WETH9[ChainId.MAINNET].address]: getTrustImage(WETH_ADDRESS_MAINNET),
}

/**
 * Addresses related to COW vesting for Locked GNO
 * These are used in src/custom/pages/Account/LockedGnoVesting hooks and index files
 */
export const MERKLE_DROP_CONTRACT_ADDRESSES: Record<number, string> = {
  [SupportedChainId.MAINNET]: '0x64646f112FfD6F1B7533359CFaAF7998F23C8c40',
  [SupportedChainId.GOERLI]: '0xD47569F96AEF2ce1CE3B3805fAA0B90045faff8A',
  [SupportedChainId.GNOSIS_CHAIN]: '0x48D8566887F8c7d99757CE29c2cD39962bfd9547',
}

export const TOKEN_DISTRO_CONTRACT_ADDRESSES: Record<number, string> = {
  [SupportedChainId.MAINNET]: '0x68FFAaC7A431f276fe73604C127Bd78E49070c92',
  [SupportedChainId.GOERLI]: '0x2f453f48a374Dd286d0Dc9aa110309c1623b29Fd',
  [SupportedChainId.GNOSIS_CHAIN]: '0x3d610e917130f9D036e85A030596807f57e11093',
}
