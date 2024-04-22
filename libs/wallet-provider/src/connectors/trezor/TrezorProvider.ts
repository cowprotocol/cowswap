import { JsonRpcProvider } from '@ethersproject/providers'
import transformTypedData from '@trezor/connect-plugin-ethereum'

import { sendTransactionHandler } from './sendTransactionHandler'
import { signTypedDataHandler } from './signTypedDataHandler'

import { getHwAccount } from './getHwAccount'

import type { TrezorConnect } from '@trezor/connect-web'
import type { Provider, RequestArguments } from '@web3modal/scaffold-utils/ethers'

const ACCOUNTS_LIMIT = 100

export class TrezorProvider extends JsonRpcProvider implements Provider {
  private accountOffset = 0
  private accounts: string[] = []

  private onInitCallback: null | (() => void) = null

  constructor(url: string, public readonly trezorConnect: TrezorConnect) {
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

  request<T>(args: RequestArguments) {
    return this.send(args.method, args.params || []).then((res) => res as T)
  }

  override async send(method: string, params: RequestArguments['params']): Promise<unknown> {
    const currentAccount = this.getCurrentAccount()

    if (method === 'eth_accounts') {
      return currentAccount ? [currentAccount] : []
    }

    if (method === 'eth_requestAccounts') {
      if (this.accounts.length) {
        return [currentAccount]
      }

      return this.loadAccounts()
    }

    if (method.startsWith('eth_signTypedData')) {
      const { domain, types, message, primaryType } = JSON.parse((params as unknown[])[1] as string)

      return signTypedDataHandler(domain, types, message, primaryType, this.trezorConnect, transformTypedData)
    }

    if (method === 'eth_sendTransaction') {
      return sendTransactionHandler(
        params as Parameters<typeof sendTransactionHandler>[0],
        this.getCurrentAccount(),
        this,
        this.trezorConnect
      )
    }

    return super.send(method, params as unknown[])
  }

  private getCurrentAccount(): string {
    const currentAccountIndex = getHwAccount().index

    return this.accounts[currentAccountIndex]
  }
}
