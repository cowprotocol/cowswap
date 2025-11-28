import { CowWidgetEventListeners, CowWidgetEvents, ToastMessageType } from '@cowprotocol/events'
import { CowSwapWidgetPaletteParams, TokenInfo, TradeType } from '@cowprotocol/widget-lib'

import { TokenListItem } from './types'

// CoW DAO addresses

export const TRADE_MODES = [TradeType.SWAP, TradeType.LIMIT, TradeType.ADVANCED, TradeType.YIELD]

// Sourced from https://tokenlists.org/
export const DEFAULT_TOKEN_LISTS: TokenListItem[] = [
  { url: 'https://files.cow.fi/tokens/CowSwap.json', enabled: true },
  { url: 'https://files.cow.fi/token-lists/CoinGecko.1.json', enabled: true },
  { url: 'https://www.gemini.com/uniswap/manifest.json', enabled: false },
  { url: 'https://messari.io/tokenlist/messari-verified', enabled: false },
  { url: 'https://static.optimism.io/optimism.tokenlist.json', enabled: false },
  { url: 'https://app.tryroll.com/tokens.json', enabled: false },
  { url: 'https://ipfs.io/ipns/tokens.uniswap.org', enabled: false },
]
// TODO: Move default palette to a new lib that only exposes the palette colors.
// This way it can be consumed by both the configurator and the widget.
export const DEFAULT_LIGHT_PALETTE: CowSwapWidgetPaletteParams = {
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

export const DEFAULT_DARK_PALETTE: CowSwapWidgetPaletteParams = {
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

export const COW_LISTENERS: CowWidgetEventListeners = [
  {
    event: CowWidgetEvents.ON_TOAST_MESSAGE,
    handler: (event) => {
      // You cn implement a more complex way to handle toast messages
      switch (event.messageType) {
        case ToastMessageType.SWAP_ETH_FLOW_SENT_TX:
          console.info('[configurator:ON_TOAST_MESSAGE:complex] 🍞 New eth flow order. Tx:', event.data.tx)
          break
        case ToastMessageType.ORDER_CREATED:
          console.info('[configurator:ON_TOAST_MESSAGE:complex] 🍞 Posted order', event.data.orderUid)
          break
        // ... and so on
        default:
          console.info('[configurator:ON_TOAST_MESSAGE:complex] 🍞 Default', event.message, event.data)
      }
    },
  },

  {
    event: CowWidgetEvents.ON_POSTED_ORDER,
    handler: (event) => console.log('[configurator:ON_POSTED_ORDER] 💌 Posted order:', event.orderUid),
  },

  {
    event: CowWidgetEvents.ON_CANCELLED_ORDER,
    handler: (event) =>
      console.log(
        `[configurator:ON_CANCELLED_ORDER] ❌ Cancelled order ${event.order.uid}. Transaction hash: ${event.transactionHash}`,
      ),
  },

  {
    event: CowWidgetEvents.ON_FULFILLED_ORDER,
    handler: (event) => console.log(`[configurator:ON_FULFILLED_ORDER] ✅ Executed order ${event.order.uid}`),
  },

  {
    event: CowWidgetEvents.ON_CHANGE_TRADE_PARAMS,
    handler: (event) => console.log(`[configurator:ON_TRADE_PARAMS] ✅ Trade params:`, event),
  },

  {
    event: CowWidgetEvents.ON_BRIDGING_SUCCESS,
    handler: (event) => console.log(`[configurator:ON_BRIDGING_SUCCESS] ✅ Bridging params:`, event),
  },
]

export const DEFAULT_CUSTOM_TOKENS: TokenInfo[] = [
  {
    chainId: 1,
    address: '0x69D29F1b0cC37d8d3B61583c99Ad0ab926142069',
    name: 'ƎԀƎԀ',
    decimals: 9,
    symbol: 'ƎԀƎԀ',
    logoURI: 'https://assets.coingecko.com/coins/images/31948/large/photo_2023-09-25_14-05-49.jpg?1696530754',
  },
  {
    chainId: 1,
    address: '0x9F9643209dCCe8D7399D7BF932354768069Ebc64',
    name: 'Invest Club Global',
    decimals: 18,
    symbol: 'ICG',
    logoURI: 'https://assets.coingecko.com/coins/images/34316/large/thatone_200%281%29.png?1704621005',
  },
]

export const IS_IFRAME = window.self !== window.top
