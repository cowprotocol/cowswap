import type { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CowEventListeners, CowEventPayloadMap, CowEvents } from '@cowprotocol/events'
export type { SupportedChainId } from '@cowprotocol/cow-sdk'

export enum WidgetMethodsEmit {
  ACTIVATE = 'ACTIVATE',
  UPDATE_HEIGHT = 'UPDATE_HEIGHT',
  SET_FULL_HEIGHT = 'SET_FULL_HEIGHT',
  EMIT_COW_EVENT = 'EMIT_COW_EVENT',
  PROVIDER_RPC_REQUEST = 'PROVIDER_RPC_REQUEST',
}

export enum WidgetMethodsListen {
  UPDATE_PARAMS = 'UPDATE_PARAMS',
  UPDATE_APP_DATA = 'UPDATE_APP_DATA',
  PROVIDER_RPC_RESPONSE = 'PROVIDER_RPC_RESPONSE',
  PROVIDER_ON_EVENT = 'PROVIDER_ON_EVENT',
}

export interface CowSwapWidgetProps {
  params: CowSwapWidgetParams
  provider?: EthereumProvider
  listeners?: CowEventListeners
}

export interface JsonRpcRequest {
  id: number
  method: string
  params: unknown[]
}

// https://eips.ethereum.org/EIPS/ei  p-1193
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

/**
 * The partner fee
 *
 * Please contact https://cowprotocol.typeform.com/to/rONXaxHV
 */
export interface PartnerFee {
  /**
   * The fee in basis points (BPS). One basis point is equivalent to 0.01% (1/100th of a percent)
   */
  bps: number

  /**
   * The Ethereum address of the partner to receive the fee.
   */
  recipient: string | Record<SupportedChainId, string>
}

/**
 * ERC-20 token information
 */
export type TokenInfo = {
  chainId: number
  address: string
  name: string
  decimals: number
  symbol: string
  logoURI?: string
}

export const WIDGET_PALETTE_COLORS = [
  'primary',
  'background',
  'paper',
  'text',
  'danger',
  'warning',
  'alert',
  'info',
  'success',
] as const

export type CowSwapWidgetPaletteColors = (typeof WIDGET_PALETTE_COLORS)[number]

export type CowSwapWidgetPaletteParams = { [K in CowSwapWidgetPaletteColors]: string }

export type CowSwapWidgetPalette = { baseTheme: CowSwapTheme } & CowSwapWidgetPaletteParams

export interface CowSwapWidgetSounds {
  /**
   * The sound to play when the order is executed. Defaults to world wide famous CoW Swap moooooooooo!
   * Alternatively, you can use a URL to a custom sound file, or set to null to disable the sound.
   */
  postOrder?: string | null

  /**
   * The sound to play when the order is executed. Defaults to world wide famous CoW Swap happy moooooooooo!
   * Alternatively, you can use a URL to a custom sound file, or set to null to disable the sound.
   */
  orderExecuted?: string | null

  /**
   * The sound to play when the order is executed. Defaults to world wide famous CoW Swap unhappy moooooooooo!
   * Alternatively, you can use a URL to a custom sound file, or set to null to disable the sound.
   */
  orderError?: string | null
}

export interface CowSwapWidgetImages {
  /**
   * The image to display when the orders table is empty (no orders yet). It defaults to "Yoga CoW" image.
   * Alternatively, you can use a URL to a custom image file, or set to null to disable the image.
   */
  emptyOrders?: string | null
}

export interface CowSwapWidgetBanners {
  /**
   * Banner text: "Use Safe web app..."
   *
   * Conditions for displaying the banner:
   *  - Safe-like app is connected to CoW Swap via WalletConnect
   *  - Selling native token via Swap
   *  - Sell token needs approval
   *
   *  If the flag is set to true, the banner will not be displayed
   */
  hideSafeWebAppBanner?: boolean
}

export interface CowSwapWidgetContent {
  feeLabel?: string
  feeTooltipMarkdown?: string
}

export interface CowSwapWidgetParams {
  /**
   * The unique identifier of the widget consumer.
   * Please fill the for to let us know a little about you: https://cowprotocol.typeform.com/to/rONXaxHV
   */
  appCode: string

  /**
   * The width of the widget in pixels. Default: 400px
   */
  width?: string
  /**
   * The height of the widget in pixels. Default: 600px
   */
  height?: string

  /**
   * Network ID.
   */
  chainId?: SupportedChainId
  /**
   * The token lists urls to use in the widget
   */
  tokenLists?: string[]
  /**
   * Swap, Limit or Advanced (Twap).
   */
  tradeType?: TradeType

  /**
   * The base url of the widget implementation
   * The parameter can have the URL directly, or an object with the environment property,
   * The base URL will default to the production environment if not specified, so it will use https://swap.cow.fi by default.
   */
  baseUrl?: string

  /**
   * Sell token, and optionally the amount.
   */
  sell?: TradeAsset

  /**
   * Buy token, and optionally the amount.
   */
  buy?: TradeAsset

  /**
   * Enables the ability to switch between trade types in the widget.
   */
  enabledTradeTypes?: TradeType[]

  /**
   * The partner fee
   *
   * Please contact https://cowprotocol.typeform.com/to/rONXaxHV
   */
  partnerFee?: PartnerFee

  /**
   * Disables showing the confirmation modal you get after posting an order.
   * Defaults to false.
   */
  disablePostedOrderConfirmationModal?: boolean

  /**
   * Disables showing the toast messages.
   * Some UI might want to disable it and subscribe to WidgetMethodsEmit.ON_TOAST_MESSAGE event to handle the toast messages itself.
   * Defaults to false.
   */
  disableToastMessages?: boolean

  /**
   * Option to hide the logo in the widget.
   */
  hideLogo?: boolean

  /**
   * Option to hide the network selector in the widget.
   */
  hideNetworkSelector?: boolean

  /**
   * Defines the widget mode.
   *  - `true` (standalone mode): The widget is standalone, so it will use its own Ethereum provider. The user can connect from within the widget.
   *  - `false` (dapp mode): The widget is embedded in a dapp which is responsible of providing the Ethereum provider. Therefore, there won't be a connect button in the widget as this should happen in the host app.
   *
   * Defaults to standalone.
   */
  standaloneMode?: boolean

  /**
   * The theme of the widget UI.
   */
  theme?: CowSwapTheme | CowSwapWidgetPalette

  /**
   * Customizable images for the widget.
   */
  images?: CowSwapWidgetImages

  /**
   * Sounds configuration for the app.
   */
  sounds?: CowSwapWidgetSounds

  /**
   * Flags to control the display of banners in the widget.
   */
  banners?: CowSwapWidgetBanners

  /**
   * In case when widget does not support some tokens, you can provide a list of tokens to be used in the widget
   */
  customTokens?: TokenInfo[]

  /**
   * Customizable labels and content for the widget.
   */
  content?: CowSwapWidgetContent
}

// Define types for event payloads
export interface WidgetMethodsEmitPayloadMap {
  [WidgetMethodsEmit.ACTIVATE]: void
  [WidgetMethodsEmit.EMIT_COW_EVENT]: EmitCowEventPayload<CowEvents>
  [WidgetMethodsEmit.UPDATE_HEIGHT]: UpdateWidgetHeightPayload
  [WidgetMethodsEmit.SET_FULL_HEIGHT]: SetWidgetFullHeightPayload
  [WidgetMethodsEmit.PROVIDER_RPC_REQUEST]: ProviderRpcRequestPayload
}

export interface WidgetMethodsListenPayloadMap {
  [WidgetMethodsListen.UPDATE_APP_DATA]: UpdateAppDataPayload
  [WidgetMethodsListen.UPDATE_PARAMS]: UpdateParamsPayload
  [WidgetMethodsListen.PROVIDER_RPC_RESPONSE]: ProviderRpcResponsePayload
  [WidgetMethodsListen.PROVIDER_ON_EVENT]: ProviderOnEventPayload
}

export type WidgetMethodsEmitPayloads = WidgetMethodsEmitPayloadMap[WidgetMethodsEmit]
export type WidgetMethodsListenPayloads = WidgetMethodsListenPayloadMap[WidgetMethodsListen]

export type CowSwapWidgetAppParams = Omit<CowSwapWidgetParams, 'theme'>

export interface UpdateParamsPayload {
  urlParams: {
    pathname: string
    // Contains theme and other query params
    search: string
  }
  appParams: CowSwapWidgetAppParams
  hasProvider: boolean
}

export interface UpdateAppDataPayload {
  metaData?: {
    appCode: string
  }
}

export interface UpdateWidgetHeightPayload {
  height?: number
}

export interface SetWidgetFullHeightPayload {
  isUpToSmall?: boolean
}

export interface EmitCowEventPayload<T extends CowEvents> {
  event: T
  payload: CowEventPayloadMap[T]
}

export type WidgetMethodsEmitListener<T extends WidgetMethodsEmit> = T extends WidgetMethodsEmit
  ? { event: T; handler: WidgetMethodHandler<T> }
  : never

export type WidgetMethodHandler<T extends WidgetMethodsEmit> = (payload: WidgetMethodsEmitPayloadMap[T]) => void

export interface ProviderRpcRequestPayload {
  rpcRequest: JsonRpcRequestMessage
}

export interface JsonRpcRequestMessage {
  jsonrpc: '2.0'
  // Optional in the request.
  id?: number
  method: string
  params: unknown[]
}

export interface BaseJsonRpcResponseMessage {
  // Required but null if not identified in request
  id: number
  jsonrpc: '2.0'
}

export interface JsonRpcSucessfulResponseMessage<TResult = unknown> extends BaseJsonRpcResponseMessage {
  result: TResult
}

export interface JsonRpcError<TData = unknown> {
  code: number
  message: string
  data?: TData
}

export interface JsonRpcErrorResponseMessage<TErrorData = unknown> extends BaseJsonRpcResponseMessage {
  error: JsonRpcError<TErrorData>
}

export type ProviderRpcResponsePayload = {
  rpcResponse: JsonRpcResponse
}

export type JsonRpcResponse = JsonRpcRequestMessage | JsonRpcErrorResponseMessage | JsonRpcSucessfulResponseMessage

export interface ProviderOnEventPayload {
  event: string
  params: unknown
}
