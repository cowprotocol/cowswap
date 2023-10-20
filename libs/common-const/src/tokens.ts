import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, Ether, NativeCurrency, Token, WETH9 } from '@uniswap/sdk-core'

import cowLogo from '@cowprotocol/assets/cow-swap/cow.svg'
import gnoLogo from '@cowprotocol/assets/cow-swap/gno.png'
import usdcLogo from '@cowprotocol/assets/cow-swap/usdc.png'
import vCowLogo from '@cowprotocol/assets/cow-swap/vCOW.png'
import wxDaiLogo from '@cowprotocol/assets/cow-swap/wxdai.png'

import {
  USDC_GNOSIS_CHAIN,
  WBTC_GNOSIS_CHAIN,
  WETH_GNOSIS_CHAIN,
  WXDAI,
  XDAI_NAME,
  XDAI_SYMBOL,
} from './gnosis_chain/constants'
import { DAI_GOERLI, USDT_GOERLI, WBTC_GOERLI, WETH_GOERLI } from './goerli/constants'
import { COW_CONTRACT_ADDRESS, V_COW_CONTRACT_ADDRESS } from './common'

export const USDC_MAINNET = new Token(
  SupportedChainId.MAINNET,
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  6,
  'USDC',
  'USD Coin'
)
export const USDC_GOERLI = new Token(
  SupportedChainId.GOERLI,
  '0x07865c6e87b9f70255377e024ace6630c1eaa37f',
  6,
  'USDC',
  'USD Coin'
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

const WETH_ADDRESS_MAINNET = WETH9[SupportedChainId.MAINNET].address

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

export const EURE_GNOSIS_CHAIN = new Token(
  SupportedChainId.GNOSIS_CHAIN,
  '0xcb444e90d8198415266c6a2724b7900fb12fc56e',
  18,
  'EURe',
  'Monerium EUR emoney'
)

export const ADDRESS_IMAGE_OVERRIDE = {
  // Goerli
  [DAI_GOERLI.address]: getTrustImage(DAI.address),
  [USDC_GOERLI.address]: getTrustImage(USDC_MAINNET.address),
  [USDT_GOERLI.address]: getTrustImage(USDT.address),
  [WBTC_GOERLI.address]: getTrustImage(WBTC.address),
  [WETH9[SupportedChainId.GOERLI].address]: getTrustImage(WETH_ADDRESS_MAINNET),
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
  [WETH9[SupportedChainId.MAINNET].address]: getTrustImage(WETH_ADDRESS_MAINNET),
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
