import { RPC_URLS } from '@cowprotocol/common-const'
import { getCurrentChainIdFromUrl } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Command } from '@cowprotocol/types'
import { Connector } from '@web3-react/types'

import { TrezorProvider } from './TrezorProvider'

import { getHwAccount } from '../../../api/utils/getHwAccount'

import type transformTypedData from '@trezor/connect-plugin-ethereum'
import type { TrezorConnect } from '@trezor/connect-web'

const defaultChainId = getCurrentChainIdFromUrl()

const trezorConfig: Parameters<TrezorConnect['init']>[0] = {
  env: 'web',
  manifest: {
    email: 'dev@cow.fi',
    appUrl: 'https://cow.fi',
  },
}

const ACCOUNTS_LIMIT = 100

export class TrezorConnector extends Connector {
  public customProvider?: TrezorProvider = undefined

  private currentAccountIndex = 0

  private activatedNetwork: SupportedChainId | null = null

  private trezorConnect: TrezorConnect | null = null

  private accounts: string[] | null = null

  private accountsOffset = 0

  private cancelActivation: Command = () => void 0

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  connectEagerly(...args: unknown[]) {
    return this.activate(args[0] as SupportedChainId)
  }

  getAccounts(): string[] | null {
    return this.accounts
  }

  async activate(
    chainId: SupportedChainId | { chainId: SupportedChainId } = defaultChainId,
    indexChanged = false,
  ): Promise<void> {
    const desiredChainId = typeof chainId === 'object' ? chainId.chainId : chainId

    // Skip when wallet already has the index set
    if (indexChanged) {
      if (this.currentAccountIndex === getHwAccount().index) {
        return
      }

      const account = this.getCurrentAccount()
      this.actions.update({ accounts: [account] })
      return
    }

    // Skip when wallet is already on the requested network
    if (this.activatedNetwork === desiredChainId && !indexChanged) {
      return
    }

    const url = RPC_URLS[desiredChainId]
    const initialConnect = this.activatedNetwork === null

    try {
      this.activatedNetwork = desiredChainId

      const { default: trezorConnect } = await import('@trezor/connect-web')
      const { default: transformTypedData } = await import('@trezor/connect-plugin-ethereum')

      this.trezorConnect = trezorConnect

      if (initialConnect) {
        this.cancelActivation = this.actions.startActivation()
        await trezorConnect.init(trezorConfig)
      }

      await this.installProvider(url, trezorConnect, transformTypedData)
    } catch (error) {
      await this.deactivate()

      console.error('Trezor activation error:', error)

      throw error
    }
  }

  deactivate(): Promise<void> | void {
    this.activatedNetwork = null
    this.accountsOffset = 0
    this.cancelActivation()

    return this.trezorConnect?.dispose()
  }

  async loadMoreAccounts(): Promise<void> {
    await this.loadAccounts(this.accountsOffset + ACCOUNTS_LIMIT)
  }

  async loadAccounts(offset: number): Promise<void> {
    this.accountsOffset = offset

    const accounts = await import('./getAccountsList').then((module) =>
      module.getAccountsList(this.trezorConnect!, offset, ACCOUNTS_LIMIT),
    )

    this.accounts = (this.accounts || []).concat(accounts || [])
  }

  private getCurrentAccount(): string {
    if (!this.accounts || this.accounts.length === 0) {
      throw new Error('Cannot load Trezor accounts. Make sure that the Trezor device is connected.')
    }

    const currentAccountIndex = getHwAccount().index
    const account = this.accounts[currentAccountIndex]

    if (!account) {
      throw new Error('Current Trezor account index is out of bounds.')
    }

    return account
  }

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private async installProvider(
    url: string,
    trezorConnect: TrezorConnect,
    _transformTypedData: typeof transformTypedData,
  ) {
    await this.loadAccounts(0)

    const account = this.getCurrentAccount()
    const customProvider = new TrezorProvider(url, this.accounts!, trezorConnect, _transformTypedData)

    this.customProvider = customProvider

    const chainId = +(await customProvider.send('eth_chainId', []))

    trezorConnect.on('DEVICE_EVENT', (event) => {
      if (event.type === 'device-disconnect') {
        this.actions.resetState()
        this.deactivate()
      }
    })

    this.currentAccountIndex = getHwAccount().index
    this.actions.update({ accounts: [account], chainId })
  }
}
