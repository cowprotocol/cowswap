import { SupportedChainId as ChainId, SupportedChainId } from '@cowprotocol/cow-sdk'

import { COW_CONTRACT_ADDRESS, V_COW_CONTRACT_ADDRESS } from './common'
import { cowprotocolTokenLogoUrl } from './cowprotocolTokenLogoUrl'
import { NATIVE_CURRENCIES, WETH_MAINNET, WRAPPED_NATIVE_CURRENCIES } from './nativeAndWrappedTokens'
import { TokenWithLogo } from './types'

// Mainnet
export const USDT = new TokenWithLogo(
  cowprotocolTokenLogoUrl('0xdAC17F958D2ee523a2206206994597C13D831ec7', SupportedChainId.MAINNET),
  SupportedChainId.MAINNET,
  '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  6,
  'USDT',
  'Tether USD',
)
export const WBTC = new TokenWithLogo(
  cowprotocolTokenLogoUrl('0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', SupportedChainId.MAINNET),
  SupportedChainId.MAINNET,
  '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
  8,
  'WBTC',
  'Wrapped BTC',
)

export const USDC_MAINNET = new TokenWithLogo(
  cowprotocolTokenLogoUrl('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', SupportedChainId.MAINNET),
  SupportedChainId.MAINNET,
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  6,
  'USDC',
  'USD Coin',
)

export const DAI = new TokenWithLogo(
  cowprotocolTokenLogoUrl('0x6b175474e89094c44da98b954eedeac495271d0f', SupportedChainId.MAINNET),
  SupportedChainId.MAINNET,
  '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  18,
  'DAI',
  'Dai Stablecoin',
)

export const GNO_MAINNET = new TokenWithLogo(
  cowprotocolTokenLogoUrl('0x6810e776880c02933d47db1b9fc05908e5386b96', SupportedChainId.MAINNET),
  SupportedChainId.MAINNET,
  '0x6810e776880c02933d47db1b9fc05908e5386b96',
  18,
  'GNO',
  'Gnosis',
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
  'Tether USD',
)
export const USDC_GNOSIS_CHAIN = new TokenWithLogo(
  USDC_MAINNET.logoURI,
  ChainId.GNOSIS_CHAIN,
  '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83',
  6,
  'USDC',
  'USD Coin (old)',
)
export const USDCe_GNOSIS_CHAIN = new TokenWithLogo(
  USDC_MAINNET.logoURI,
  ChainId.GNOSIS_CHAIN,
  '0x2a22f9c3b484c3629090feed35f17ff8f88f76f0',
  6,
  'USDC.e',
  'USD Coin',
)
export const WBTC_GNOSIS_CHAIN = new TokenWithLogo(
  WBTC.logoURI,
  ChainId.GNOSIS_CHAIN,
  '0x8e5bbbb09ed1ebde8674cda39a0c169401db4252',
  8,
  'WBTC',
  'Wrapped BTC',
)
export const WETH_GNOSIS_CHAIN = new TokenWithLogo(
  WETH_MAINNET.logoURI,
  ChainId.GNOSIS_CHAIN,
  '0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1',
  18,
  'WETH',
  'Wrapped Ether on Gnosis Chain',
)
export const GNO_GNOSIS_CHAIN = new TokenWithLogo(
  GNO_MAINNET.logoURI,
  ChainId.GNOSIS_CHAIN,
  '0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb',
  18,
  'GNO',
  'Gnosis Token',
)

export const EURE_GNOSIS_CHAIN = new TokenWithLogo(
  cowprotocolTokenLogoUrl('0xcb444e90d8198415266c6a2724b7900fb12fc56e', SupportedChainId.GNOSIS_CHAIN),
  SupportedChainId.GNOSIS_CHAIN,
  '0xcb444e90d8198415266c6a2724b7900fb12fc56e',
  18,
  'EURe',
  'Monerium EUR emoney',
)

// Arbitrum

export const USDT_ARBITRUM_ONE = new TokenWithLogo(
  USDT.logoURI,
  SupportedChainId.ARBITRUM_ONE,
  '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
  6,
  'USDT',
  'Tether USD',
)
export const WBTC_ARBITRUM_ONE = new TokenWithLogo(
  WBTC.logoURI,
  SupportedChainId.ARBITRUM_ONE,
  '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
  8,
  'WBTC',
  'Wrapped BTC',
)

export const USDC_ARBITRUM_ONE = new TokenWithLogo(
  USDC_MAINNET.logoURI,
  SupportedChainId.ARBITRUM_ONE,
  '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
  6,
  'USDC',
  'USD Coin',
)

export const DAI_ARBITRUM_ONE = new TokenWithLogo(
  DAI.logoURI,
  SupportedChainId.ARBITRUM_ONE,
  '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
  18,
  'DAI',
  'Dai Stablecoin',
)

export const ARB_ARBITRUM_ONE = new TokenWithLogo(
  cowprotocolTokenLogoUrl('0xb50721bcf8d664c30412cfbc6cf7a15145234ad1', SupportedChainId.ARBITRUM_ONE),
  SupportedChainId.ARBITRUM_ONE,
  '0x912ce59144191c1204e64559fe8253a0e49e6548',
  18,
  'ARB',
  'Arbitrum',
)

export const GNO_ARBITRUM_ONE = new TokenWithLogo(
  GNO_MAINNET.logoURI,
  SupportedChainId.ARBITRUM_ONE,
  '0xa0b862F60edEf4452F25B4160F177db44DeB6Cf1',
  18,
  'GNO',
  'Gnosis Token',
)

const USDE_ARBITRUM_ONE = new TokenWithLogo(
  cowprotocolTokenLogoUrl('0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34', SupportedChainId.ARBITRUM_ONE),
  SupportedChainId.ARBITRUM_ONE,
  '0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34',
  18,
  'USDe',
  'USDe',
)

const USDCE_ARBITRUM_ONE = new TokenWithLogo(
  cowprotocolTokenLogoUrl('0xff970a61a04b1ca14834a43f5de4533ebddb5cc8', SupportedChainId.ARBITRUM_ONE),
  SupportedChainId.ARBITRUM_ONE,
  '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8',
  6,
  'USDC',
  'USD Coin (Arb1)',
)

const USDM_ARBITRUM_ONE = new TokenWithLogo(
  cowprotocolTokenLogoUrl('0x59d9356e565ab3a36dd77763fc0d87feaf85508c', SupportedChainId.ARBITRUM_ONE),
  SupportedChainId.ARBITRUM_ONE,
  '0x59D9356E565Ab3A36dD77763Fc0d87fEaf85508C',
  18,
  'USDM',
  'Mountain Protocol USD',
)

const FRAX_ARBITRUM_ONE = new TokenWithLogo(
  cowprotocolTokenLogoUrl('0x17fc002b466eec40dae837fc4be5c67993ddbd6f', SupportedChainId.ARBITRUM_ONE),
  SupportedChainId.ARBITRUM_ONE,
  '0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F',
  18,
  'FRAX',
  'Frax',
)

const MIM_ARBITRUM_ONE = new TokenWithLogo(
  cowprotocolTokenLogoUrl('0x99d8a9c45b2eca8864373a26d1459e3dff1e17f3', SupportedChainId.ARBITRUM_ONE),
  SupportedChainId.ARBITRUM_ONE,
  '0xFEa7a6a0B346362BF88A9e4A88416B77a57D6c2A',
  18,
  'MIM',
  'Magic Internet Money',
)

// Base

export const USDT_BASE = new TokenWithLogo(
  USDT.logoURI,
  SupportedChainId.BASE,
  '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
  6,
  'USDT',
  'Tether USD',
)
export const CBBTC_BASE = new TokenWithLogo(
  cowprotocolTokenLogoUrl('0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf', SupportedChainId.BASE),
  SupportedChainId.BASE,
  '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf',
  8,
  'cbBTC',
  'Coinbase Wrapped BTC',
)

export const USDC_BASE = new TokenWithLogo(
  USDC_MAINNET.logoURI,
  SupportedChainId.BASE,
  '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  6,
  'USDC',
  'USD Coin',
)

export const DAI_BASE = new TokenWithLogo(
  DAI.logoURI,
  SupportedChainId.BASE,
  '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
  18,
  'DAI',
  'Dai Stablecoin',
)

export const DOLA_BASE = new TokenWithLogo(
  cowprotocolTokenLogoUrl('0x4621b7A9c75199271F773Ebd9A499dbd165c3191', SupportedChainId.BASE),
  SupportedChainId.BASE,
  '0x4621b7A9c75199271F773Ebd9A499dbd165c3191',
  18,
  'DOLA',
  'Dola USD Stablecoin',
)

export const USDZ_BASE = new TokenWithLogo(
  cowprotocolTokenLogoUrl('0x04d5ddf5f3a8939889f11e97f8c4bb48317f1938', SupportedChainId.BASE),
  SupportedChainId.BASE,
  '0x04d5ddf5f3a8939889f11e97f8c4bb48317f1938',
  18,
  'USDz',
  'USDz',
)

export const EURC_BASE = new TokenWithLogo(
  cowprotocolTokenLogoUrl('0x60a3e35cc302bfa44cb288bc5a4f316fdb1adb42', SupportedChainId.BASE),
  SupportedChainId.BASE,
  '0x60a3e35cc302bfa44cb288bc5a4f316fdb1adb42',
  6,
  'EURC',
  'EURC',
)

export const CGUSD_BASE = new TokenWithLogo(
  cowprotocolTokenLogoUrl('0xca72827a3d211cfd8f6b00ac98824872b72cab49', SupportedChainId.BASE),
  SupportedChainId.BASE,
  '0xca72827a3d211cfd8f6b00ac98824872b72cab49',
  6,
  'cgUSD',
  'Cygnus Global USD',
)

export const USD_PLUS_BASE = new TokenWithLogo(
  cowprotocolTokenLogoUrl('0xb79dd08ea68a908a97220c76d19a6aa9cbde4376', SupportedChainId.BASE),
  SupportedChainId.BASE,
  '0xb79dd08ea68a908a97220c76d19a6aa9cbde4376',
  6,
  'USD+',
  'USD+',
)

export const EUSD_BASE = new TokenWithLogo(
  cowprotocolTokenLogoUrl('0xcfa3ef56d303ae4faaba0592388f19d7c3399fb4', SupportedChainId.BASE),
  SupportedChainId.BASE,
  '0xcfa3ef56d303ae4faaba0592388f19d7c3399fb4',
  18,
  'eUSD',
  'Electronic Dollar',
)

// Sepolia

export const GNO_SEPOLIA = new TokenWithLogo(
  GNO_MAINNET.logoURI,
  SupportedChainId.SEPOLIA,
  '0xd3f3d46FeBCD4CdAa2B83799b7A5CdcB69d135De',
  18,
  'GNO',
  'GNO (test)',
)

// Sepolia
export const USDC_SEPOLIA = new TokenWithLogo(
  USDC_MAINNET.logoURI,
  SupportedChainId.SEPOLIA,
  '0xbe72E441BF55620febc26715db68d3494213D8Cb',
  18,
  'USDC',
  'USDC (test)',
)
export const USDT_SEPOLIA = new TokenWithLogo(
  USDT.logoURI,
  SupportedChainId.SEPOLIA,
  '0x58eb19ef91e8a6327fed391b51ae1887b833cc91',
  6,
  'USDT',
  'Tether USD',
)

export const USDC: Record<SupportedChainId, TokenWithLogo> = {
  [SupportedChainId.MAINNET]: USDC_MAINNET,
  [SupportedChainId.GNOSIS_CHAIN]: USDC_GNOSIS_CHAIN,
  [SupportedChainId.ARBITRUM_ONE]: USDC_ARBITRUM_ONE,
  [SupportedChainId.BASE]: USDC_BASE,
  [SupportedChainId.SEPOLIA]: USDC_SEPOLIA,
}

export const TOKEN_SHORTHANDS: { [shorthand: string]: Record<SupportedChainId, string> } = {
  USDC: {
    [SupportedChainId.MAINNET]: USDC_MAINNET.address,
    [SupportedChainId.GNOSIS_CHAIN]: USDC_GNOSIS_CHAIN.address,
    [SupportedChainId.ARBITRUM_ONE]: USDC_ARBITRUM_ONE.address,
    [SupportedChainId.BASE]: USDC_BASE.address,
    [SupportedChainId.SEPOLIA]: USDC_SEPOLIA.address,
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
  'CoW Protocol Virtual Token',
)

const V_COW_TOKEN_XDAI = new TokenWithLogo(
  V_COW_TOKEN_MAINNET.logoURI,
  SupportedChainId.GNOSIS_CHAIN,
  V_COW_CONTRACT_ADDRESS[SupportedChainId.GNOSIS_CHAIN] || '',
  18,
  'vCOW',
  'CoW Protocol Virtual Token',
)

const V_COW_TOKEN_SEPOLIA = new TokenWithLogo(
  V_COW_TOKEN_MAINNET.logoURI,
  SupportedChainId.SEPOLIA,
  V_COW_CONTRACT_ADDRESS[SupportedChainId.SEPOLIA] || '',
  18,
  'vCOW',
  'CoW Protocol Virtual Token',
)

export const V_COW: Record<SupportedChainId, TokenWithLogo | null> = {
  [SupportedChainId.MAINNET]: V_COW_TOKEN_MAINNET,
  [SupportedChainId.GNOSIS_CHAIN]: V_COW_TOKEN_XDAI,
  [SupportedChainId.ARBITRUM_ONE]: null,
  [SupportedChainId.BASE]: null,
  [SupportedChainId.SEPOLIA]: V_COW_TOKEN_SEPOLIA,
}

/**
 * Cow token
 */
const COW_TOKEN_MAINNET = new TokenWithLogo(
  undefined,
  SupportedChainId.MAINNET,
  COW_CONTRACT_ADDRESS[SupportedChainId.MAINNET],
  18,
  'COW',
  'CoW Protocol Token',
)

const COW_TOKEN_XDAI = new TokenWithLogo(
  COW_TOKEN_MAINNET.logoURI,
  SupportedChainId.GNOSIS_CHAIN,
  COW_CONTRACT_ADDRESS[SupportedChainId.GNOSIS_CHAIN],
  18,
  'COW',
  'CoW Protocol Token',
)

export const COW_TOKEN_ARBITRUM = new TokenWithLogo(
  COW_TOKEN_MAINNET.logoURI,
  SupportedChainId.ARBITRUM_ONE,
  COW_CONTRACT_ADDRESS[SupportedChainId.ARBITRUM_ONE],
  18,
  'COW',
  'CoW Protocol Token',
)

export const COW_TOKEN_BASE = new TokenWithLogo(
  COW_TOKEN_MAINNET.logoURI,
  SupportedChainId.BASE,
  COW_CONTRACT_ADDRESS[SupportedChainId.BASE],
  18,
  'COW',
  'CoW Protocol Token',
)

const COW_TOKEN_SEPOLIA = new TokenWithLogo(
  COW_TOKEN_MAINNET.logoURI,
  SupportedChainId.SEPOLIA,
  COW_CONTRACT_ADDRESS[SupportedChainId.SEPOLIA],
  18,
  'COW',
  'CoW Protocol Token',
)

export const COW: Record<SupportedChainId, TokenWithLogo> = {
  [SupportedChainId.MAINNET]: COW_TOKEN_MAINNET,
  [SupportedChainId.GNOSIS_CHAIN]: COW_TOKEN_XDAI,
  [SupportedChainId.ARBITRUM_ONE]: COW_TOKEN_ARBITRUM,
  [SupportedChainId.BASE]: COW_TOKEN_BASE,
  [SupportedChainId.SEPOLIA]: COW_TOKEN_SEPOLIA,
}

export const GNO: Record<SupportedChainId, TokenWithLogo | null> = {
  [SupportedChainId.MAINNET]: GNO_MAINNET,
  [SupportedChainId.GNOSIS_CHAIN]: GNO_GNOSIS_CHAIN,
  [SupportedChainId.ARBITRUM_ONE]: GNO_ARBITRUM_ONE,
  [SupportedChainId.BASE]: null,
  [SupportedChainId.SEPOLIA]: GNO_SEPOLIA,
}

const SDAI_GNOSIS_CHAIN_ADDRESS = '0xaf204776c7245bf4147c2612bf6e5972ee483701'
const GBPE_GNOSIS_CHAIN_ADDRESS = '0x5cb9073902f2035222b9749f8fb0c9bfe5527108'

// Not used for fees
const MAINNET_STABLECOINS = [USDC_MAINNET.address, USDT.address, DAI.address].map((t) => t.toLowerCase())

// NOTE: whenever this list is updated, make sure to update the docs section regarding the volume fees
// https://github.com/cowprotocol/docs/blob/main/docs/governance/fees/fees.md?plain=1#L40
const GNOSIS_CHAIN_STABLECOINS = [
  SDAI_GNOSIS_CHAIN_ADDRESS,
  NATIVE_CURRENCIES[SupportedChainId.GNOSIS_CHAIN].address, //xDAI
  WRAPPED_NATIVE_CURRENCIES[SupportedChainId.GNOSIS_CHAIN].address, //wxDAI
  EURE_GNOSIS_CHAIN.address,
  GBPE_GNOSIS_CHAIN_ADDRESS,
  USDC_GNOSIS_CHAIN.address,
  USDCe_GNOSIS_CHAIN.address,
  USDT_GNOSIS_CHAIN.address,
].map((t) => t.toLowerCase())

const ARBITRUM_ONE_STABLECOINS = [
  USDC_ARBITRUM_ONE.address,
  DAI_ARBITRUM_ONE.address,
  USDT_ARBITRUM_ONE.address,
  USDE_ARBITRUM_ONE.address,
  USDM_ARBITRUM_ONE.address,
  USDCE_ARBITRUM_ONE.address,
  FRAX_ARBITRUM_ONE.address,
  MIM_ARBITRUM_ONE.address,
].map((t) => t.toLowerCase())

// Not used for fees
const BASE_STABLECOINS = [
  USDC_BASE.address,
  DAI_BASE.address,
  DOLA_BASE.address,
  USDZ_BASE.address,
  EURC_BASE.address,
  CGUSD_BASE.address,
  USD_PLUS_BASE.address,
  EUSD_BASE.address,
  USDT_BASE.address,
].map((t) => t.toLowerCase())

// Not used for fees
const SEPOLIA_STABLECOINS = [USDC_SEPOLIA.address, USDT_SEPOLIA.address].map((t) => t.toLowerCase())

export const STABLECOINS: Record<ChainId, Set<string>> = {
  [SupportedChainId.MAINNET]: new Set(MAINNET_STABLECOINS),
  [SupportedChainId.GNOSIS_CHAIN]: new Set(GNOSIS_CHAIN_STABLECOINS),
  [SupportedChainId.ARBITRUM_ONE]: new Set(ARBITRUM_ONE_STABLECOINS),
  [SupportedChainId.SEPOLIA]: new Set(SEPOLIA_STABLECOINS),
  [SupportedChainId.BASE]: new Set(BASE_STABLECOINS),
}

console.debug('STABLECOINS', STABLECOINS)

/**
 * Addresses related to COW vesting for Locked GNO
 * These are used in src/custom/pages/Account/LockedGnoVesting hooks and index files
 */
export const MERKLE_DROP_CONTRACT_ADDRESSES: Record<SupportedChainId, string> = {
  [SupportedChainId.MAINNET]: '0x64646f112FfD6F1B7533359CFaAF7998F23C8c40',
  [SupportedChainId.GNOSIS_CHAIN]: '0x48D8566887F8c7d99757CE29c2cD39962bfd9547',
  [SupportedChainId.ARBITRUM_ONE]: '', // doesn't exist
  [SupportedChainId.BASE]: '', // doesn't exist
  [SupportedChainId.SEPOLIA]: '', // TODO SEPOLIA: check it
}

export const TOKEN_DISTRO_CONTRACT_ADDRESSES: Record<SupportedChainId, string> = {
  [SupportedChainId.MAINNET]: '0x68FFAaC7A431f276fe73604C127Bd78E49070c92',
  [SupportedChainId.GNOSIS_CHAIN]: '0x3d610e917130f9D036e85A030596807f57e11093',
  [SupportedChainId.ARBITRUM_ONE]: '', // doesn't exist
  [SupportedChainId.BASE]: '', // doesn't exist
  [SupportedChainId.SEPOLIA]: '', // TODO SEPOLIA: check it
}
