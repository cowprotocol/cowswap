import { Token } from '@uniswap/sdk-core'
import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'

// native constants
export const XDAI_SYMBOL = 'XDAI'
export const XDAI_NAME = 'xDai'

// xDAI tokens
export const WXDAI = new Token(
  ChainId.GNOSIS_CHAIN,
  '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d',
  18,
  'WXDAI',
  'Wrapped XDAI'
)
export const HONEY_GNOSIS_CHAIN = new Token(
  ChainId.GNOSIS_CHAIN,
  '0x71850b7e9ee3f13ab46d67167341e4bdc905eef9',
  18,
  'HNY',
  'Honey'
)
export const USDT_GNOSIS_CHAIN = new Token(
  ChainId.GNOSIS_CHAIN,
  '0x4ECaBa5870353805a9F068101A40E0f32ed605C6',
  6,
  'USDT',
  'Tether USD'
)
export const USDC_GNOSIS_CHAIN = new Token(
  ChainId.GNOSIS_CHAIN,
  '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83',
  6,
  'USDC',
  'USD Coin'
)
export const SUSD_GNOSIS_CHAIN = new Token(
  ChainId.GNOSIS_CHAIN,
  '0xB1950Fb2C9C0CbC8553578c67dB52Aa110A93393',
  18,
  'sUSD',
  'Synth sUSD'
)
export const WBTC_GNOSIS_CHAIN = new Token(
  ChainId.GNOSIS_CHAIN,
  '0x8e5bbbb09ed1ebde8674cda39a0c169401db4252',
  8,
  'WBTC',
  'Wrapped BTC'
)
export const WETH_GNOSIS_CHAIN = new Token(
  ChainId.GNOSIS_CHAIN,
  '0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1',
  18,
  'WETH',
  'Wrapped Ether on Gnosis Chain'
)

export const GNO_GNOSIS_CHAIN = new Token(
  ChainId.GNOSIS_CHAIN,
  '0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb',
  18,
  'GNO',
  'Gnosis Token'
)
export const STAKE_GNOSIS_CHAIN = new Token(
  ChainId.GNOSIS_CHAIN,
  '0xb7D311E2Eb55F2f68a9440da38e7989210b9A05e',
  18,
  'STAKE',
  'STAKE'
)
export const OWL_GNOSIS_CHAIN = new Token(
  ChainId.GNOSIS_CHAIN,
  '0x0905Ab807F8FD040255F0cF8fa14756c1D824931',
  18,
  'OWL',
  'OWL'
)
