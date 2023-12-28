import { TradeType } from '@cowprotocol/widget-lib'

import { TokenListItem } from './types'

export const TRADE_MODES = [TradeType.SWAP, TradeType.LIMIT, TradeType.ADVANCED]

// Sourced from https://tokenlists.org/
export const DEFAULT_TOKEN_LISTS: TokenListItem[] = [
  { url: 'https://files.cow.fi/tokens/CowSwap.json', enabled: true },
  { url: 'https://tokens.coingecko.com/uniswap/all.json', enabled: true },
  { url: 'https://tokens.1inch.eth.link', enabled: false },
  { url: 'https://tokenlist.aave.eth.link', enabled: false },
  { url: 'https://datafi.theagora.eth.link', enabled: false },
  { url: 'https://defi.cmc.eth.link', enabled: false },
  { url: 'https://stablecoin.cmc.eth.link', enabled: false },
  { url: 'https://erc20.cmc.eth.link', enabled: false },
  {
    url: 'https://raw.githubusercontent.com/compound-finance/token-list/master/compound.tokenlist.json',
    enabled: false,
  },
  { url: 'https://tokenlist.dharma.eth.link', enabled: false },
  { url: 'https://www.gemini.com/uniswap/manifest.json', enabled: false },
  { url: 'https://t2crtokens.eth.link', enabled: false },
  { url: 'https://messari.io/tokenlist/messari-verified', enabled: false },
  { url: 'https://uniswap.mycryptoapi.com', enabled: false },
  { url: 'https://static.optimism.io/optimism.tokenlist.json', enabled: false },
  { url: 'https://app.tryroll.com/tokens.json', enabled: false },
  { url: 'https://raw.githubusercontent.com/SetProtocol/uniswap-tokenlist/main/set.tokenlist.json', enabled: false },
  { url: 'https://synths.snx.eth.link', enabled: false },
  { url: 'https://testnet.tokenlist.eth.link', enabled: false },
  { url: 'https://gateway.ipfs.io/ipns/tokens.uniswap.org', enabled: false },
  { url: 'https://wrapped.tokensoft.eth.link', enabled: false },
]
// TODO: Move default palette to a new lib that only exposes the palette colors.
// This wayit can be consumed by both the configurator and the widget.
export const DEFAULT_LIGHT_PALETTE = {
  primary: '#052b65',
  background: '#FFFFFF',
  paper: '#FFFFFF',
  text: '#052B65',
  danger: '#D41300',
  warning: '#F8D06B',
  alert: '#DB971E',
  info: '#0d5ed9',
  success: '#007B28',
}

export const DEFAULT_DARK_PALETTE = {
  primary: '#0d5ed9',
  background: '#303030',
  paper: '#0c264b',
  text: '#CAE9FF',
  danger: '#f44336',
  warning: '#F8D06B',
  alert: '#DB971E',
  info: '#428dff',
  success: '#00D897',
}
