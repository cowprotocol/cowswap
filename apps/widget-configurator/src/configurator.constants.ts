import { COW_CDN, SupportedLocale, LOCALE_DISPLAY_NAMES, SUPPORTED_LOCALES } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CowWidgetEventListeners, CowWidgetEvents, ToastMessageType } from '@cowprotocol/events'
import { CowSwapWidgetPaletteParams, TokenInfo, TradeType, WidgetHookEvents } from '@cowprotocol/widget-lib'

import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'

import { DEFAULT_IFRAME_STYLE_JSON } from './components/controls/AppearanceStyleControls/AppearanceStyleControls.utils'
import { ConfiguratorFormValues, TokenListItem, WidgetMode } from './configurator.types'

import type { SelectInputOption } from './components/ui/inputs/Select/base/BaseSelectInput.types'

// Environment:

export const isLocalHost = ['localhost', '127.0.0.1'].includes(window.location.hostname)

export const isVercel = window.location.hostname.includes('vercel.app')

export const isDev = ['dev.widget.cow.fi', 'dev.swap.cow.fi'].includes(window.location.hostname)

export const IS_IFRAME = window.self !== window.top

// Preview:

/** Live preview `appCode` when Basics is blank; embed snippet treats this like unset and substitutes the snippet placeholder app code. */
export const CONFIGURATOR_WIDGET_PREVIEW_APP_CODE_FALLBACK = 'CoW Widget: Configurator' as const

/** Older widget apps (custom baseUrl) may not post READY; hide the preview loader after this timeout. */
export const WIDGET_PREVIEW_READY_FALLBACK_MS = 60_000

// UTM:

export const UTM_PARAMS = 'utm_content=cow-widget-configurator&utm_medium=web&utm_source=widget.cow.fi' as const

// Form options:

export const LOCALE_OPTIONS: SelectInputOption<SupportedLocale>[] = [
  { label: 'Browser default', value: '' },
  ...SUPPORTED_LOCALES.map((option) => ({ label: LOCALE_DISPLAY_NAMES[option] || option, value: option })),
]

export type ThemeOptionValue = 'light' | 'dark'

export const THEME_OPTIONS: SelectInputOption<ThemeOptionValue>[] = [
  { label: 'Light', value: 'light', icon: LightModeIcon },
  { label: 'Dark', value: 'dark', icon: DarkModeIcon },
]

export const WIDGET_MODE_OPTIONS: SelectInputOption<WidgetMode>[] = [
  { label: 'Dapp mode', value: 'dapp' },
  { label: 'Standalone mode', value: 'standalone' },
]

export const TRADE_MODES = [TradeType.SWAP, TradeType.LIMIT, TradeType.ADVANCED, TradeType.YIELD]

export const TRADE_MODES_OPTIONS: SelectInputOption<TradeType>[] = TRADE_MODES.map((option) => ({
  label: option,
  value: option,
}))

export const TRADE_TYPE_OPTIONS: SelectInputOption<TradeType>[] = Object.values(TradeType).map((option) => ({
  label: option,
  value: option,
}))

export const WIDGET_HOOKS_OPTIONS: SelectInputOption<WidgetHookEvents>[] = Object.values(WidgetHookEvents).map(
  (option) => ({ label: option, value: option }),
)

// Persistence:

export const CONFIGURATOR_FORM_VALUES_STORAGE_KEY = 'widget-cfg-form-values'
export const CONFIGURATOR_CUSTOM_COLORS_BY_THEME_STORAGE_KEY = 'widget-cfg-custom-colors'
export const CONFIGURATOR_THEME_STORAGE_KEY = 'widget-cfg-theme'
export const CONFIGURATOR_SIDEBAR_OPEN_STORAGE_KEY = 'widget-cfg-sidebar-open'
export const CONFIGURATOR_SIDEBAR_WIDTH_STORAGE_KEY = 'widget-cfg-sidebar-width'

// Defaults:

export const DEFAULT_STATE = {
  sellToken: 'USDC',
  buyToken: 'COW',
  sellAmount: 100000,
  buyAmount: 0,
} as const

export const DEFAULT_TOKEN_LISTS: TokenListItem[] = [
  { url: `${COW_CDN}/tokens/CowSwap.json`, enabled: true, enabledForSell: false, enabledForBuy: false },
  { url: `${COW_CDN}/token-lists/CoinGecko.1.json`, enabled: true, enabledForSell: false, enabledForBuy: false },
  {
    url: 'https://wispy-bird-88a7.uniswap.workers.dev/?url=http://stablecoin.cmc.eth.link',
    enabled: false,
    enabledForSell: false,
    enabledForBuy: false,
  },
  { url: 'https://www.gemini.com/uniswap/manifest.json', enabled: false, enabledForSell: false, enabledForBuy: false },
  { url: 'https://messari.io/tokenlist/messari-verified', enabled: false, enabledForSell: false, enabledForBuy: false },
  {
    url: 'https://static.optimism.io/optimism.tokenlist.json',
    enabled: false,
    enabledForSell: false,
    enabledForBuy: false,
  },
  { url: 'https://app.tryroll.com/tokens.json', enabled: false, enabledForSell: false, enabledForBuy: false },
  { url: 'https://ipfs.io/ipns/tokens.uniswap.org', enabled: false, enabledForSell: false, enabledForBuy: false },
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

export const DEFAULT_CONFIGURATOR_FORM_VALUES: ConfiguratorFormValues = {
  // Basics:

  appCode: '',
  widgetMode: 'dapp',
  locale: '',

  // Trade Setup:

  enabledTradeTypes: TRADE_MODES,
  currentTradeType: TRADE_MODES[0],
  chainId: SupportedChainId.MAINNET,
  disableCrossChainSwap: false,

  // Tokens:

  sellToken: DEFAULT_STATE.sellToken,
  sellTokenAmount: DEFAULT_STATE.sellAmount,
  buyToken: DEFAULT_STATE.buyToken,
  buyTokenAmount: DEFAULT_STATE.buyAmount,
  tokenListUrls: DEFAULT_TOKEN_LISTS,
  customTokens: [],

  // Theme Colors:

  theme: 'light',

  // Layout:

  disableScrollbars: false,
  showIframeOutline: true,
  iframeStyleJson: DEFAULT_IFRAME_STYLE_JSON,
  bodyWrapperStyleJson: '{}',
  cardStyleJson: '{}',

  // Behavior:

  disableProgressBar: false,
  disablePostTradeTips: false,
  disableTokenImport: false,
  hideRecentTokens: false,
  hideFavoriteTokens: false,
  hideBridgeInfo: false,
  hideOrdersTable: false,
  disableTradeWhenPriceImpactIsUnknown: false,
  disableTradeWhenPriceImpactIsHigherThan: undefined,

  // Deadlines:

  deadline: undefined,
  swapDeadline: undefined,
  limitDeadline: undefined,
  advancedDeadline: undefined,

  // Integrations:

  partnerFeeBps: 0,

  // Customization:

  customImages: {},
  customSounds: {},

  // Advanced:

  baseUrl: null,
  enabledWidgetHooks: [],
  rawParamsJson: '{}',
}

// Palettes:

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

// TODO: Make it possible to define per-theme props in the style properties.
// TODO: This is not used.
// Keep in sync with the widget theme defaults from libs/ui/src/colors.ts
export const DEFAULT_WIDGET_SHADOW = {
  light: '0 12px 12px rgba(5, 43, 101, 0.06)',
  dark: '0 24px 32px rgba(0, 0, 0, 0.06)',
} as const

// Widget events:

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
