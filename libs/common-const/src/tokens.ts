import { SupportedChainId as ChainId, SupportedChainId } from '@cowprotocol/cow-sdk'

import { COW_CONTRACT_ADDRESS, V_COW_CONTRACT_ADDRESS } from './common'
import { cowprotocolTokenLogoUrl } from './cowprotocolTokenLogoUrl'
import { WETH_MAINNET } from './nativeAndWrappedTokens'
import { TokenWithLogo } from './types'

// Mainnet
export const USDT = new TokenWithLogo(
  cowprotocolTokenLogoUrl('0xdAC17F958D2ee523a2206206994597C13D831ec7', SupportedChainId.MAINNET),
  SupportedChainId.MAINNET,
  '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  6,
  'USDT',
  'Tether USD'
)
export const WBTC = new TokenWithLogo(
  cowprotocolTokenLogoUrl('0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', SupportedChainId.MAINNET),
  SupportedChainId.MAINNET,
  '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
  8,
  'WBTC',
  'Wrapped BTC'
)

export const USDC_MAINNET = new TokenWithLogo(
  cowprotocolTokenLogoUrl('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', SupportedChainId.MAINNET),
  SupportedChainId.MAINNET,
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  6,
  'USDC',
  'USD Coin'
)

export const DAI = new TokenWithLogo(
  cowprotocolTokenLogoUrl('0x6b175474e89094c44da98b954eedeac495271d0f', SupportedChainId.MAINNET),
  SupportedChainId.MAINNET,
  '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  18,
  'DAI',
  'Dai Stablecoin'
)

const GNO_MAINNET = new TokenWithLogo(
  cowprotocolTokenLogoUrl('0x6810e776880c02933d47db1b9fc05908e5386b96', SupportedChainId.MAINNET),
  SupportedChainId.MAINNET,
  '0x6810e776880c02933d47db1b9fc05908e5386b96',
  18,
  'GNO',
  'Gnosis'
)

// Gnosis chain
export const XDAI_SYMBOL = 'XDAI'
export const XDAI_NAME = 'xDai'
export const USDT_GNOSIS_CHAIN = new TokenWithLogo(
  USDT.logoURI,
  ChainId.GNOSIS_CHAIN,
  '0x4ECaBa5870353805a9F068101A40E0f32ed605C6',
  6,
  'USDT',
  'Tether USD'
)
export const USDC_GNOSIS_CHAIN = new TokenWithLogo(
  USDC_MAINNET.logoURI,
  ChainId.GNOSIS_CHAIN,
  '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83',
  6,
  'USDC',
  'USD Coin'
)
export const WBTC_GNOSIS_CHAIN = new TokenWithLogo(
  WBTC.logoURI,
  ChainId.GNOSIS_CHAIN,
  '0x8e5bbbb09ed1ebde8674cda39a0c169401db4252',
  8,
  'WBTC',
  'Wrapped BTC'
)
export const WETH_GNOSIS_CHAIN = new TokenWithLogo(
  WETH_MAINNET.logoURI,
  ChainId.GNOSIS_CHAIN,
  '0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1',
  18,
  'WETH',
  'Wrapped Ether on Gnosis Chain'
)
export const GNO_GNOSIS_CHAIN = new TokenWithLogo(
  GNO_MAINNET.logoURI,
  ChainId.GNOSIS_CHAIN,
  '0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb',
  18,
  'GNO',
  'Gnosis Token'
)

// Sepolia

const GNO_SEPOLIA = new TokenWithLogo(
  GNO_MAINNET.logoURI,
  SupportedChainId.SEPOLIA,
  '0xd3f3d46FeBCD4CdAa2B83799b7A5CdcB69d135De',
  18,
  'GNO',
  'GNO (test)'
)

// Sepolia
export const USDC_SEPOLIA = new TokenWithLogo(
  USDC_MAINNET.logoURI,
  SupportedChainId.SEPOLIA,
  '0xbe72E441BF55620febc26715db68d3494213D8Cb',
  18,
  'USDC',
  'USDC (test)'
)

export const USDC: Record<SupportedChainId, TokenWithLogo> = {
  [SupportedChainId.MAINNET]: USDC_MAINNET,
  [SupportedChainId.GNOSIS_CHAIN]: USDC_GNOSIS_CHAIN,
  [SupportedChainId.SEPOLIA]: USDC_SEPOLIA,
}

export const TOKEN_SHORTHANDS: { [shorthand: string]: Record<SupportedChainId, string> } = {
  USDC: {
    [SupportedChainId.MAINNET]: USDC_MAINNET.address,
    [SupportedChainId.SEPOLIA]: USDC_SEPOLIA.address,
    [SupportedChainId.GNOSIS_CHAIN]: USDC_GNOSIS_CHAIN.address,
  },
}

/**
 * vCow token
 */
const V_COW_TOKEN_MAINNET = new TokenWithLogo(
  undefined,
  SupportedChainId.MAINNET,
  V_COW_CONTRACT_ADDRESS[SupportedChainId.MAINNET] || '',
  18,
  'vCOW',
  'CoW Protocol Virtual Token'
)

const V_COW_TOKEN_XDAI = new TokenWithLogo(
  V_COW_TOKEN_MAINNET.logoURI,
  SupportedChainId.GNOSIS_CHAIN,
  V_COW_CONTRACT_ADDRESS[SupportedChainId.GNOSIS_CHAIN] || '',
  18,
  'vCOW',
  'CoW Protocol Virtual Token'
)

const V_COW_TOKEN_SEPOLIA = new TokenWithLogo(
  V_COW_TOKEN_MAINNET.logoURI,
  SupportedChainId.SEPOLIA,
  V_COW_CONTRACT_ADDRESS[SupportedChainId.SEPOLIA] || '',
  18,
  'vCOW',
  'CoW Protocol Virtual Token'
)

export const V_COW: Record<SupportedChainId, TokenWithLogo> = {
  [SupportedChainId.MAINNET]: V_COW_TOKEN_MAINNET,
  [SupportedChainId.GNOSIS_CHAIN]: V_COW_TOKEN_XDAI,
  [SupportedChainId.SEPOLIA]: V_COW_TOKEN_SEPOLIA,
}

/**
 * Cow token
 */
const COW_TOKEN_MAINNET = new TokenWithLogo(
  undefined,
  SupportedChainId.MAINNET,
  COW_CONTRACT_ADDRESS[SupportedChainId.MAINNET] || '',
  18,
  'COW',
  'CoW Protocol Token'
)

const COW_TOKEN_XDAI = new TokenWithLogo(
  COW_TOKEN_MAINNET.logoURI,
  SupportedChainId.GNOSIS_CHAIN,
  COW_CONTRACT_ADDRESS[SupportedChainId.GNOSIS_CHAIN] || '',
  18,
  'COW',
  'CoW Protocol Token'
)

const COW_TOKEN_SEPOLIA = new TokenWithLogo(
  COW_TOKEN_MAINNET.logoURI,
  SupportedChainId.SEPOLIA,
  COW_CONTRACT_ADDRESS[SupportedChainId.SEPOLIA] || '',
  18,
  'COW',
  'CoW Protocol Token'
)

export const COW: Record<SupportedChainId, TokenWithLogo> = {
  [SupportedChainId.MAINNET]: COW_TOKEN_MAINNET,
  [SupportedChainId.GNOSIS_CHAIN]: COW_TOKEN_XDAI,
  [SupportedChainId.SEPOLIA]: COW_TOKEN_SEPOLIA,
}

export const GNO: Record<SupportedChainId, TokenWithLogo> = {
  [SupportedChainId.MAINNET]: GNO_MAINNET,
  [SupportedChainId.GNOSIS_CHAIN]: GNO_GNOSIS_CHAIN,
  [SupportedChainId.SEPOLIA]: GNO_SEPOLIA,
}

export const EURE_GNOSIS_CHAIN = new TokenWithLogo(
  cowprotocolTokenLogoUrl('0xcb444e90d8198415266c6a2724b7900fb12fc56e', SupportedChainId.GNOSIS_CHAIN),
  SupportedChainId.GNOSIS_CHAIN,
  '0xcb444e90d8198415266c6a2724b7900fb12fc56e',
  18,
  'EURe',
  'Monerium EUR emoney'
)

/**
 * Addresses related to COW vesting for Locked GNO
 * These are used in src/custom/pages/Account/LockedGnoVesting hooks and index files
 */
export const MERKLE_DROP_CONTRACT_ADDRESSES: Record<SupportedChainId, string> = {
  [SupportedChainId.MAINNET]: '0x64646f112FfD6F1B7533359CFaAF7998F23C8c40',
  [SupportedChainId.GNOSIS_CHAIN]: '0x48D8566887F8c7d99757CE29c2cD39962bfd9547',
  [SupportedChainId.SEPOLIA]: '', // TODO SEPOLIA: check it
}

export const TOKEN_DISTRO_CONTRACT_ADDRESSES: Record<SupportedChainId, string> = {
  [SupportedChainId.MAINNET]: '0x68FFAaC7A431f276fe73604C127Bd78E49070c92',
  [SupportedChainId.GNOSIS_CHAIN]: '0x3d610e917130f9D036e85A030596807f57e11093',
  [SupportedChainId.SEPOLIA]: '', // TODO SEPOLIA: check it
}
