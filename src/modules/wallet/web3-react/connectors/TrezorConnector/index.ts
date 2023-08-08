import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Connector } from '@web3-react/types'

import { RPC_URLS } from 'legacy/constants/networks'

import { getCurrentChainIdFromUrl } from 'utils/getCurrentChainIdFromUrl'

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

export class TrezorConnector extends Connector {
  public customProvider?: TrezorProvider

  private currentAccountIndex = 0

  private activatedNetwork: SupportedChainId | null = null

  private trezorConnect: TrezorConnect | null = null

  private cancelActivation: () => void = () => void 0

  connectEagerly(...args: unknown[]) {
    return this.activate(args[0] as SupportedChainId)
  }

  async activate(
    chainId: SupportedChainId | { chainId: SupportedChainId } = defaultChainId,
    indexChanged = false
  ): Promise<void> {
    const desiredChainId = typeof chainId === 'object' ? chainId.chainId : chainId

    // Skip when wallet already has the index set
    if (indexChanged) {
      if (this.currentAccountIndex === getHwAccount().index) {
        return
      }
    }

    // Skip when wallet already on the requested network
    if (this.activatedNetwork === desiredChainId && !indexChanged) {
      return
    }

    const { default: trezorConnect } = await import('@trezor/connect-web')
    const { default: transformTypedData } = await import('@trezor/connect-plugin-ethereum')

    this.trezorConnect = trezorConnect

    const url = RPC_URLS[desiredChainId]
    const initialConnect = this.activatedNetwork === null

    this.activatedNetwork = desiredChainId

    try {
      if (initialConnect) {
        this.cancelActivation = this.actions.startActivation()
        await trezorConnect.init(trezorConfig)
      }

      await this.installProvider(url, trezorConnect, transformTypedData)
    } catch (error) {
      this.handleActivationError(error)
    }
  }

  deactivate(): Promise<void> | void {
    return this.customProvider?.trezorConnect.dispose()
  }

  private async getAccount(): Promise<string> {
    if (!this.trezorConnect) return ''

    const accountResult = await this.trezorConnect.ethereumGetAddress({
      path: getHwAccount().path,
      showOnTrezor: false,
    })

    if (!accountResult.success) {
      throw new Error(accountResult.payload.error)
    }

    return accountResult.payload.address
  }

  private handleActivationError(error: Error) {
    alert(error.message)

    this.activatedNetwork = null
    this.cancelActivation()

    throw error
  }

  private async installProvider(
    url: string,
    trezorConnect: TrezorConnect,
    _transformTypedData: typeof transformTypedData
  ) {
    const account = await this.getAccount()

    const customProvider = new TrezorProvider(url, account, trezorConnect, _transformTypedData)

    this.customProvider = customProvider

    const network = await customProvider.getNetwork()
    const { chainId } = network

    this.currentAccountIndex = getHwAccount().index
    this.actions.update({ accounts: [account], chainId })
  }
}
