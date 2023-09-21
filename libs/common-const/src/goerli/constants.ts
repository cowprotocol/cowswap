import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { Token } from '@uniswap/sdk-core'

// Todo: address should be updated
export const DAI_GOERLI = new Token(ChainId.GOERLI, '0xdc31Ee1784292379Fbb2964b3B9C4124D8F89C60', 18, 'DAI', 'DAI')

export const USDT_GOERLI = new Token(
  ChainId.GOERLI,
  '0xe583769738b6dd4e7caf8451050d1948be717679',
  6,
  'USDT',
  'Tether USD'
)
export const USDC_GOERLI = new Token(
  ChainId.GOERLI,
  '0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C',
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
export const WETH_GOERLI = new Token(
  ChainId.GOERLI,
  '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
  18,
  'WETH',
  'Wrapped Görli Ether'
)
