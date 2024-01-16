import { OrderClass } from '@cowprotocol/cow-sdk'

export enum Category {
  TRADE = 'Trade',
  LIST = 'Lists',
  CURRENCY_SELECT = 'Currency Select',
  EXPERT_MODE = 'Expert mode',
  RECIPIENT_ADDRESS = 'Recipient address',
  ORDER_SLIPAGE_TOLERANCE = 'Order Slippage Tolerance',
  ORDER_EXPIRATION_TIME = 'Order Expiration Time',
  WALLET = 'Wallet',
  WRAP_NATIVE_TOKEN = 'Wrapped Native Token',
  CLAIM_COW_FOR_LOCKED_GNO = 'Claim COW for Locked GNO',
  THEME = 'Theme',
  GAMES = 'Games',
  EXTERNAL_LINK = 'External Link',
  INIT = 'Init',
  SERVICE_WORKER = 'Service worker',
  TWAP = 'TWAP',
  COW_FORTUNE = 'CoWFortune',
  WIDGET_CONFIGURATOR = 'Widget configurator',
}

export interface EventParams {
  category: Category
  action: string
  label?: string
  value?: number
}

export enum Dimensions {
  chainId = 'chainId',
  walletName = 'walletName',
  customBrowserType = 'customBrowserType',
  userAddress = 'userAddress',
  market = 'market',
  injectedWidgetAppId = 'injectedWidgetAppId',
}

// TODO: use UiOrderType instead
export type AnalyticsOrderType = OrderClass | 'TWAP'
