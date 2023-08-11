import { JsonRpcProvider } from '@ethersproject/providers'

import { sendTransactionHandler } from './sendTransactionHandler'
import { signTypedDataHandler } from './signTypedDataHandler'

import type transformTypedData from '@trezor/connect-plugin-ethereum'
import type { TrezorConnect } from '@trezor/connect-web'

export class TrezorProvider extends JsonRpcProvider {
  constructor(
    url: string,
    public readonly account: string,
    public readonly trezorConnect: TrezorConnect,
    public readonly _transformTypedData: typeof transformTypedData
  ) {
    super(url)
  }

  async send(method: string, params: Array<any>): Promise<any> {
    if (method === 'eth_accounts') {
      return [this.account]
    }

    if (method.startsWith('eth_signTypedData')) {
      const { domain, types, message, primaryType } = JSON.parse(params[1])

      return signTypedDataHandler(domain, types, message, primaryType, this.trezorConnect, this._transformTypedData)
    }

    if (method === 'eth_sendTransaction') {
      return sendTransactionHandler(params, this.account, this, this.trezorConnect)
    }

    return super.send(method, params)
  }
}
