import { SupportedChainId as ChainId, SupportedChainId } from '@cowprotocol/cow-sdk'

import { COW_CONTRACT_ADDRESS, V_COW_CONTRACT_ADDRESS } from './common'
import { TokenWithLogo } from './types'
import { cowprotocolTokenLogoUrl } from './cowprotocolTokenLogoUrl'
import { WETH_MAINNET } from './nativeAndWrappedTokens'

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

// Goerli
export const USDC_GOERLI = new TokenWithLogo(
  USDC_MAINNET.logoURI,
  SupportedChainId.GOERLI,
  '0x07865c6e87b9f70255377e024ace6630c1eaa37f',
  6,
  'USDC',
  'USD Coin'
)
export const DAI_GOERLI = new TokenWithLogo(
  DAI.logoURI,
  ChainId.GOERLI,
  '0xdc31Ee1784292379Fbb2964b3B9C4124D8F89C60',
  18,
  'DAI',
  'DAI'
)
export const USDT_GOERLI = new TokenWithLogo(
  USDT.logoURI,
  ChainId.GOERLI,
  '0xe583769738b6dd4e7caf8451050d1948be717679',
  6,
  'USDT',
  'Tether USD'
)
export const WBTC_GOERLI = new TokenWithLogo(
  WBTC.logoURI,
  ChainId.GOERLI,
  '0xca063a2ab07491ee991dcecb456d1265f842b568',
  8,
  'WBTC',
  'Wrapped BTC'
)

const GNO_GOERLI = new TokenWithLogo(
  GNO_MAINNET.logoURI,
  SupportedChainId.GOERLI,
  '0x02abbdbaaa7b1bb64b5c878f7ac17f8dda169532',
  18,
  'GNO',
  'Gnosis'
)

export const USDC: Record<SupportedChainId, TokenWithLogo> = {
  [SupportedChainId.MAINNET]: USDC_MAINNET,
  [SupportedChainId.GOERLI]: USDC_GOERLI,
  [SupportedChainId.GNOSIS_CHAIN]: USDC_GNOSIS_CHAIN,
}

export const TOKEN_SHORTHANDS: { [shorthand: string]: { [chainId in SupportedChainId]?: string } } = {
  USDC: {
    [SupportedChainId.MAINNET]: USDC_MAINNET.address,
    [SupportedChainId.GOERLI]: USDC_GOERLI.address,
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

const V_COW_TOKEN_GOERLI = new TokenWithLogo(
  V_COW_TOKEN_MAINNET.logoURI,
  SupportedChainId.GOERLI,
  V_COW_CONTRACT_ADDRESS[SupportedChainId.GOERLI] || '',
  18,
  'vCOW',
  'CoW Protocol Virtual Token'
)

export const V_COW: Record<SupportedChainId, TokenWithLogo> = {
  [SupportedChainId.MAINNET]: V_COW_TOKEN_MAINNET,
  [SupportedChainId.GNOSIS_CHAIN]: V_COW_TOKEN_XDAI,
  [SupportedChainId.GOERLI]: V_COW_TOKEN_GOERLI,
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

const COW_TOKEN_GOERLI = new TokenWithLogo(
  COW_TOKEN_MAINNET.logoURI,
  SupportedChainId.GOERLI,
  COW_CONTRACT_ADDRESS[SupportedChainId.GOERLI] || '',
  18,
  'COW',
  'CoW Protocol Token'
)

export const COW: Record<SupportedChainId, TokenWithLogo> = {
  [SupportedChainId.MAINNET]: COW_TOKEN_MAINNET,
  [SupportedChainId.GNOSIS_CHAIN]: COW_TOKEN_XDAI,
  [SupportedChainId.GOERLI]: COW_TOKEN_GOERLI,
}

export const GNO: Record<SupportedChainId, TokenWithLogo> = {
  [SupportedChainId.MAINNET]: GNO_MAINNET,
  [SupportedChainId.GNOSIS_CHAIN]: GNO_GNOSIS_CHAIN,
  [SupportedChainId.GOERLI]: GNO_GOERLI,
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
