import { Token } from '@uniswap/sdk-core'
import { SupportedChainId as ChainId } from 'constants/chains'

// Todo: address should be updated
export const DAI_GOERLI = new Token(ChainId.GOERLI, '0x5c221e77624690fff6dd741493d735a17716c26b', 18, 'DAI', 'DAI')

export const USDT_GOERLI = new Token(
  ChainId.GOERLI,
  '0xe583769738b6dd4e7caf8451050d1948be717679',
  6,
  'USDT',
  'Tether USD'
)
export const USDC_GOERLI = new Token(
  ChainId.GOERLI,
  '0x5ddba296458986e462ba4aeb4dddc00fadc9c43b',
  6,
  'USDC',
  'USD Coin'
)
export const WBTC_GOERLI = new Token(
  ChainId.GOERLI,
  '0xca063a2ab07491ee991dcecb456d1265f842b568',
  8,
  'WBTC',
  'Wrapped BTC'
)
