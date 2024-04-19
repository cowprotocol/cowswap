import { JsonRpcProvider } from '@ethersproject/providers'

import { sendTransactionHandler } from './sendTransactionHandler'
import { signTypedDataHandler } from './signTypedDataHandler'

import { getHwAccount } from './getHwAccount'

import type transformTypedData from '@trezor/connect-plugin-ethereum'
import type { TrezorConnect } from '@trezor/connect-web'

const ACCOUNTS_LIMIT = 100

interface RequestArguments {
  method: string
  params?: unknown[]
}

export interface EIP1193Provider {
  request(args: RequestArguments): Promise<unknown>
}

export class TrezorProvider extends JsonRpcProvider implements EIP1193Provider {
  private accountOffset = 0
  private accounts: string[] = []

  private onInitCallback: null | (() => void) = null

  constructor(
    url: string,
    public readonly trezorConnect: TrezorConnect,
    public readonly _transformTypedData: typeof transformTypedData
  ) {
    super(url)
  }

  getAccounts(): string[] | null {
    return this.accounts
  }

  loadMoreAccounts() {
    this.accountOffset += ACCOUNTS_LIMIT

    return this.loadAccounts().then(() => undefined)
  }

  onInit(onInitCallback: () => void) {
    this.onInitCallback = onInitCallback
  }

  loadAccounts() {
    return import('./getAccountsList').then(async ({ getAccountsList }) => {
      const accounts = await getAccountsList(this.trezorConnect, this.accountOffset, ACCOUNTS_LIMIT)

      if (accounts) {
        this.accounts.push(...accounts)
      }

      this.onInitCallback?.()

      return [this.getCurrentAccount()]
    })
  }

  request(args: RequestArguments) {
    return this.send(args.method, args.params || []).then((res) => {
      return res
    })
  }

  override async send(method: string, params: Array<unknown>): Promise<unknown> {
    if (method === 'eth_accounts' || method === 'eth_requestAccounts') {
      if (this.accounts.length) {
        return [this.getCurrentAccount()]
      }

      return this.loadAccounts()
    }

    if (method.startsWith('eth_signTypedData')) {
      const { domain, types, message, primaryType } = JSON.parse(params[1] as string)

      return signTypedDataHandler(domain, types, message, primaryType, this.trezorConnect, this._transformTypedData)
    }

    if (method === 'eth_sendTransaction') {
      return sendTransactionHandler(
        params as Parameters<typeof sendTransactionHandler>[0],
        this.getCurrentAccount(),
        this,
        this.trezorConnect
      )
    }

    return super.send(method, params)
  }

  private getCurrentAccount(): string {
    const currentAccountIndex = getHwAccount().index

    return this.accounts[currentAccountIndex]
  }
}
