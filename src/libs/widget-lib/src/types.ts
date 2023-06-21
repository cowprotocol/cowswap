declare global {
  interface Window {
    ethereum?: EthereumProvider
  }
}

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

export type CowSwapWidgetEnv = 'local' | 'prod' | 'barn'

export type CowSwapTheme = 'dark' | 'light'

interface TradeAsset {
  asset: string
  amount?: string
}

export interface TradeAssets {
  sell: TradeAsset
  buy: TradeAsset
}

export interface CowSwapWidgetUrlParams {
  chainId?: number
  env?: CowSwapWidgetEnv
  tradeAssets?: TradeAssets
  theme?: CowSwapTheme
}

export interface CowSwapWidgetParams {
  container: HTMLElement
  width?: number
  height?: number
  urlParams?: CowSwapWidgetUrlParams
  provider?: EthereumProvider
}
