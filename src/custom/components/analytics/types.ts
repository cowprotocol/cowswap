export enum Category {
  SWAP = 'Swap',
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
  SERVICE_WORKER = 'Service workder',
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
}
