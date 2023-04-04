import type { RequestArguments } from '@web3-react/types'

export interface EthereumProvider {
  autoRefreshOnNetworkChange?: boolean
  providers?: EthereumProvider[]
  isConnected: () => boolean
  request<T>(args: RequestArguments): Promise<T>
  chainId: string
  selectedAddress: string
  on(eventName: string | symbol, listener: (...args: any[]) => void): this;
  removeListener(eventName: string | symbol, listener: (...args: any[]) => void): this;
  [key: string]: boolean
}

declare global {
  interface Window {
    ethereum?: EthereumProvider
  }
}
