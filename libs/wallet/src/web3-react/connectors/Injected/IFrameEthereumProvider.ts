// eslint-disable-next-line no-restricted-imports

import { IFrameEthereumProvider as OriginalIFrameEthereumProvider } from './OriginalIframeEthereumProvider'

export class IFrameEthereumProvider extends OriginalIFrameEthereumProvider {
  request<T>({ method, params }: { method: string; params?: any[] }) {
    // console.log('[TEST:IFrameEthereumProvider] IFrameEthereumProvider - rpc request', { method, params })
    return this.send<typeof params, T>(method, params)
  }

  isConnected(): true {
    return true
  }
}
