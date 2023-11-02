import type { SupportedChainId } from '@cowprotocol/cow-sdk'

export interface JsonRpcRequest {
  id: number
  method: string
  params: unknown[]
}

// https://eips.ethereum.org/EIPS/eip-1193
export interface EthereumProvider {
  /**
   * Subscribes to Ethereum-related events.
   * @param event - The event to subscribe to.
   * @param args - Arguments for the event.
   */
  on(event: string, args: unknown): void

  /**
   * Sends a JSON-RPC request to the Ethereum provider and returns the response.
   * @param params - JSON-RPC request parameters.
   * @returns A promise that resolves with the response.
   */
  request<T>(params: JsonRpcRequest): Promise<T>

  /**
   * Requests permission to connect to the Ethereum provider.
   * @returns A promise that resolves once permission is granted.
   */
  enable(): Promise<void>
}

export type CowSwapWidgetEnv = 'local' | 'prod' | 'dev' | 'pr'

export type CowSwapTheme = 'dark' | 'light'

/**
 *Trade asset parameters, for example:
 * { asset: 'WBTC', amount: 12 }
 * or
 * { asset: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' } // USDC
 */
interface TradeAsset {
  /** The asset symbol or identifier. */
  asset: string
  /**
   * The amount of the asset (optional).
   * If specified, represents the quantity or value of the asset.
   */
  amount?: string
}

export interface TradeAssets {
  sell: TradeAsset
  buy: TradeAsset
}

export enum TradeType {
  SWAP = 'swap',
  LIMIT = 'limit',
  /**
   * Currently it means only TWAP orders.
   * But in the future it can be extended to support other order types.
   */
  ADVANCED = 'advanced',
}

export interface CowSwapWidgetUrlParams {
  chainId?: SupportedChainId
  tradeType?: TradeType
  env?: CowSwapWidgetEnv
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
  /**
   * Allows to set a custom logo for the widget.
   */
  logoUrl?: string
  /**
   * Option to hide the logo in the widget.
   */
  hideLogo?: boolean
  /**
   * Option to hide the network selector in the widget.
   */
  hideNetworkSelector?: boolean
  /**
   * Enables dynamic height for the widget.
   * The widget will resize itself to fit the content.
   */
  dynamicHeightEnabled?: boolean
  /**
   * Enables the ability to switch between trade types in the widget.
   */
  enabledTradeTypes?: TradeType[]
  /**
   * Colors palette to customize the widget UI.
   */
  palette?: CowSwapWidgetPalette
}

export type CowSwapWidgetSettings = CowSwapWidgetUrlParams & CowSwapWidgetAppParams

export interface CowSwapWidgetMetaData {
  /**
   * The unique identifier of the widget consumer.
   */
  appKey: string
  /**
   * The URL of the website that embeds the widget.
   */
  url: string
}

export interface CowSwapWidgetParams {
  width: number
  height: number
  container: HTMLElement
  metaData: CowSwapWidgetMetaData
  provider?: EthereumProvider
}
