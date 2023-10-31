export interface JsonRpcRequest {
  id: number
  method: string
  params: unknown[]
}

// https://eips.ethereum.org/EIPS/eip-1193
export interface EthereumProvider {
  on(event: string, args: unknown): void
  request<T>(params: JsonRpcRequest): Promise<T>
  enable(): Promise<void>
}

export type CowSwapWidgetEnv = 'local' | 'prod' | 'dev' | 'pr'

export type CowSwapTheme = 'dark' | 'light'

interface TradeAsset {
  asset: string
  amount?: string
}

export interface TradeAssets {
  sell: TradeAsset
  buy: TradeAsset
}

export enum TradeType {
  SWAP = 'swap',
  LIMIT = 'limit',
  ADVANCED = 'advanced',
}

export interface CowSwapWidgetUrlParams {
  chainId: number
  tradeType: TradeType
  env: CowSwapWidgetEnv
  tradeAssets?: TradeAssets
  theme?: CowSwapTheme
}

export interface CowSwapWidgetPalette {
  primaryColor: string
  screenBackground: string
  widgetBackground: string
  textColor: string
}

export interface CowSwapWidgetAppParams {
  logoUrl?: string
  hideLogo?: boolean
  hideNetworkSelector?: boolean
  dynamicHeightEnabled?: boolean
  enabledTradeTypes?: TradeType[]
  palette?: CowSwapWidgetPalette
}

export type CowSwapWidgetSettings = CowSwapWidgetUrlParams & CowSwapWidgetAppParams

export interface CowSwapWidgetMetaData {
  appKey: string
  url: string
}

export interface CowSwapWidgetParams {
  width: number
  height: number
  container: HTMLElement
  metaData: CowSwapWidgetMetaData
  provider?: EthereumProvider
}
