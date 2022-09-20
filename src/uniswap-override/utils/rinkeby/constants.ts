import { Token } from '@uniswap/sdk-core'
import { SupportedChainId as ChainId } from 'constants/chains'

export const DAI_RINKEBY = new Token(ChainId.RINKEBY, '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea', 18, 'DAI', 'DAI')

export const USDT_RINKEBY = new Token(
  ChainId.RINKEBY,
  '0xa9881E6459CA05d7D7C95374463928369cD7a90C',
  6,
  'USDT',
  'Tether USD'
)
export const USDC_RINKEBY = new Token(
  ChainId.RINKEBY,
  '0x4DBCdF9B62e891a7cec5A2568C3F4FAF9E8Abe2b',
  6,
  'USDC',
  'USD Coin'
)
export const WBTC_RINKEBY = new Token(
  ChainId.RINKEBY,
  '0x577D296678535e4903D59A4C929B718e1D575e0A',
  8,
  'WBTC',
  'Wrapped BTC'
)
