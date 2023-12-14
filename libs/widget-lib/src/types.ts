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

export enum TradeType {
  SWAP = 'swap',
  LIMIT = 'limit',
  /**
   * Currently it means only TWAP orders.
   * But in the future it can be extended to support other order types.
   */
  ADVANCED = 'advanced',
}

export interface CowSwapWidgetPalette {
  baseTheme: CowSwapTheme
  primary: string
  background: string
  paper: string
  text: string
  danger: string
  warning: string
  alert: string
  info: string
  success: string
}

interface CowSwapWidgetConfig {
  /**
   * The width of the widget in pixels. Default: 400px
   */
  width: string
  /**
   * The height of the widget in pixels. Default: 600px
   */
  height: string
  /**
   * The unique identifier of the widget consumer.
   * Please fill the for to let us know a little about you: https://cowprotocol.typeform.com/to/rONXaxHV
   */
  appCode: string
  /**
   * The widget might be connected to a custom Ethereum provider.
   */
  provider: EthereumProvider

  /**
   * Network ID.
   */
  chainId: SupportedChainId
  /**
   * Swap, Limit or Advanced (Twap).
   */
  tradeType: TradeType
  /**
   * The environment of the widget. Default: prod
   */
  env: CowSwapWidgetEnv

  /**
   * Sell token, and optionally the amount.
   */
  sell: TradeAsset

  /**
   * Buy token, and optionally the amount.
   */
  buy: TradeAsset

  /**
   * The theme of the widget UI.
   */
  theme: CowSwapTheme | CowSwapWidgetPalette

  /**
   * Allows to set a custom logo for the widget.
   */
  logoUrl: string

  /**
   * Option to hide the logo in the widget.
   */
  hideLogo: boolean

  /**
   * Option to hide the network selector in the widget.
   */
  hideNetworkSelector: boolean

  /**
   * Enables the ability to switch between trade types in the widget.
   */
  enabledTradeTypes: TradeType[]

  /**
   * The interface fee in basis points.
   * For example: 1.5% = 150 bips
   *
   * Please contact https://cowprotocol.typeform.com/to/rONXaxHV
   */
  interfaceFeeBips: string
}

export type CowSwapWidgetParams = Partial<CowSwapWidgetConfig>
