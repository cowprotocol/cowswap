import { Currency, Ether, NativeCurrency, Token, WETH9 } from '@uniswap/sdk-core'

import { UNI_ADDRESS } from './addresses'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import {
  USDC_GNOSIS_CHAIN,
  WBTC_GNOSIS_CHAIN,
  WETH_GNOSIS_CHAIN,
  WXDAI,
  XDAI_NAME,
  XDAI_SYMBOL,
} from 'legacy/utils/gnosis_chain/constants'
import { DAI_GOERLI, USDT_GOERLI, WBTC_GOERLI, WETH_GOERLI } from 'legacy/utils/goerli/constants'
import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { COW_CONTRACT_ADDRESS, V_COW_CONTRACT_ADDRESS } from 'legacy/constants'
import vCowLogo from 'legacy/assets/cow-swap/vCOW.png'
import cowLogo from 'legacy/assets/cow-swap/cow.svg'
import gnoLogo from 'legacy/assets/cow-swap/gno.png'
import usdcLogo from 'legacy/assets/cow-swap/usdc.png'
import wxDaiLogo from 'legacy/assets/cow-swap/wxdai.png'

export const USDC_MAINNET = new Token(
  SupportedChainId.MAINNET,
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  6,
  'USDC',
  'USD//C'
)
export const USDC_GOERLI = new Token(
  SupportedChainId.GOERLI,
  '0x07865c6e87b9f70255377e024ace6630c1eaa37f',
  6,
  'USDC',
  'USD//C'
)
export const AMPL = new Token(
  SupportedChainId.MAINNET,
  '0xD46bA6D942050d489DBd938a2C909A5d5039A161',
  9,
  'AMPL',
  'Ampleforth'
)
export const DAI = new Token(
  SupportedChainId.MAINNET,
  '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  18,
  'DAI',
  'Dai Stablecoin'
)
export const USDC: { [chainId in SupportedChainId]: Token } = {
  [SupportedChainId.MAINNET]: USDC_MAINNET,
  [SupportedChainId.GOERLI]: USDC_GOERLI,
  [SupportedChainId.GNOSIS_CHAIN]: USDC_GNOSIS_CHAIN,
}
export const USDT = new Token(
  SupportedChainId.MAINNET,
  '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  6,
  'USDT',
  'Tether USD'
)
export const WBTC = new Token(
  SupportedChainId.MAINNET,
  '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
  8,
  'WBTC',
  'Wrapped BTC'
)
export const FEI = new Token(
  SupportedChainId.MAINNET,
  '0x956F47F50A910163D8BF957Cf5846D573E7f87CA',
  18,
  'FEI',
  'Fei USD'
)
export const TRIBE = new Token(
  SupportedChainId.MAINNET,
  '0xc7283b66Eb1EB5FB86327f08e1B5816b0720212B',
  18,
  'TRIBE',
  'Tribe'
)
export const FRAX = new Token(
  SupportedChainId.MAINNET,
  '0x853d955aCEf822Db058eb8505911ED77F175b99e',
  18,
  'FRAX',
  'Frax'
)
export const FXS = new Token(
  SupportedChainId.MAINNET,
  '0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0',
  18,
  'FXS',
  'Frax Share'
)
export const renBTC = new Token(
  SupportedChainId.MAINNET,
  '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D',
  8,
  'renBTC',
  'renBTC'
)
export const ETH2X_FLI = new Token(
  SupportedChainId.MAINNET,
  '0xAa6E8127831c9DE45ae56bB1b0d4D4Da6e5665BD',
  18,
  'ETH2x-FLI',
  'ETH 2x Flexible Leverage Index'
)
export const sETH2 = new Token(
  SupportedChainId.MAINNET,
  '0xFe2e637202056d30016725477c5da089Ab0A043A',
  18,
  'sETH2',
  'StakeWise Staked ETH2'
)
export const rETH2 = new Token(
  SupportedChainId.MAINNET,
  '0x20BC832ca081b91433ff6c17f85701B6e92486c5',
  18,
  'rETH2',
  'StakeWise Reward ETH2'
)
export const SWISE = new Token(
  SupportedChainId.MAINNET,
  '0x48C3399719B582dD63eB5AADf12A40B4C3f52FA2',
  18,
  'SWISE',
  'StakeWise'
)

export const UNI: { [chainId: number]: Token } = {
  [SupportedChainId.MAINNET]: new Token(SupportedChainId.MAINNET, UNI_ADDRESS[1], 18, 'UNI', 'Uniswap'),
  [SupportedChainId.GOERLI]: new Token(SupportedChainId.GOERLI, UNI_ADDRESS[5], 18, 'UNI', 'Uniswap'),
}

export const WRAPPED_NATIVE_CURRENCY: { [chainId in SupportedChainId]: Token } = {
  [SupportedChainId.MAINNET]: WETH9[SupportedChainId.MAINNET],
  [SupportedChainId.GNOSIS_CHAIN]: WXDAI,
  [SupportedChainId.GOERLI]: WETH_GOERLI,
}

export class ExtendedEther extends Ether {
  public get wrapped(): Token {
    const wrapped = WRAPPED_NATIVE_CURRENCY[this.chainId as SupportedChainId]
    if (wrapped) return wrapped
    throw new Error('Unsupported chain ID')
  }

  private static _cachedExtendedEther: { [chainId: number]: NativeCurrency } = {}

  public static onChain(chainId: number): ExtendedEther {
    return this._cachedExtendedEther[chainId] ?? (this._cachedExtendedEther[chainId] = new ExtendedEther(chainId))
  }
}

function isGnosisChain(chainId: number): chainId is SupportedChainId.GNOSIS_CHAIN {
  return chainId === SupportedChainId.GNOSIS_CHAIN
}

class GnosisChainNativeCurrency extends NativeCurrency {
  equals(other: Currency): boolean {
    return other.isNative && other.chainId === this.chainId
  }

  get wrapped(): Token {
    if (!isGnosisChain(this.chainId)) throw new Error('Not Gnosis Chain')
    return WRAPPED_NATIVE_CURRENCY[this.chainId as SupportedChainId]
  }

  public constructor(chainId: number) {
    if (!isGnosisChain(chainId)) throw new Error('Not Gnosis Chain')
    super(chainId, 18, XDAI_SYMBOL, XDAI_NAME)
  }
}

const cachedNativeCurrency: { [chainId: number]: NativeCurrency } = {}
export function nativeOnChain(chainId: number): NativeCurrency {
  return (
    cachedNativeCurrency[chainId] ??
    (cachedNativeCurrency[chainId] = isGnosisChain(chainId)
      ? new GnosisChainNativeCurrency(chainId)
      : ExtendedEther.onChain(chainId))
  )
}

export class GpEther extends Ether {
  public get wrapped(): Token {
    if (this.chainId in WRAPPED_NATIVE_CURRENCY) return WRAPPED_NATIVE_CURRENCY[this.chainId as SupportedChainId]
    throw new Error('Unsupported chain ID')
  }

  private static _cachedExtendedEther: { [chainId: number]: NativeCurrency } = {}

  public static onChain = nativeOnChain
}

export const TOKEN_SHORTHANDS: { [shorthand: string]: { [chainId in SupportedChainId]?: string } } = {
  USDC: {
    [SupportedChainId.MAINNET]: USDC_MAINNET.address,
    [SupportedChainId.GOERLI]: USDC_GOERLI.address,
    [SupportedChainId.GNOSIS_CHAIN]: USDC_GNOSIS_CHAIN.address,
  },
}

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
