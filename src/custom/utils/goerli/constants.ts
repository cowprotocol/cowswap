import { Token } from '@uniswap/sdk-core'
import { SupportedChainId as ChainId } from 'constants/chains'

export const DAI_GOERLI = new Token(ChainId.GOERLI, '0x73967c6a0904aA032C103b4104747E88c566B1A2', 18, 'DAI', 'DAI')

export const USDT_GOERLI = new Token(
  ChainId.GOERLI,
  '0x51445dcDdF5246229bAE8C0BA3EA462e63038641',
  6,
  'USDT',
  'Tether USD'
)
export const USDC_GOERLI = new Token(
  ChainId.GOERLI,
  '0x5FfbaC75EFc9547FBc822166feD19B05Cd5890bb',
  6,
  'USDC',
  'USD Coin'
)
export const WBTC_GOERLI = new Token(
  ChainId.GOERLI,
  '0xE6d830937FA8DB2ebD2c046C58F797A95550fA4E',
  8,
  'WBTC',
  'Wrapped BTC'
)
