// eslint-disable-next-line no-restricted-imports
import { IFrameEthereumProvider as OriginalIFrameEthereumProvider } from '@ethvault/iframe-provider/dist/index'

export class IFrameEthereumProvider extends OriginalIFrameEthereumProvider {
  request<T>({ method, params }: { method: string; params?: any[] }) {
    return this.send<typeof params, T>(method, params)
  }

  isConnected(): true {
    return true
  }
}
