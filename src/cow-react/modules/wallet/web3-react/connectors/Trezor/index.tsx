import { Actions, Connector } from '@web3-react/types'
import Web3ProviderEngine from 'web3-provider-engine'
import TrezorConnect from '@trezor/connect-web'
import transformTypedData from '@trezor/connect-plugin-ethereum'

global.process = { browser: true } as any
const TrezorSubprovider = require('@0x/subproviders/lib/src/subproviders/trezor').TrezorSubprovider
const RPCSubprovider = require('@0x/subproviders/lib/src/subproviders/rpc_subprovider').RPCSubprovider

interface LedgerConstructorArgs {
  actions: Actions
  onError?: () => void
  options?: TrezorOptions
}

interface TrezorOptions {
  chainId?: number
  url?: string
  manifestEmail: string
  manifestAppUrl: string
}

function parseChainId(chainId: number | string) {
  return Number.parseInt(String(chainId), 16)
}

const DEFAULT_MANIFEST_EMAIL = ''
const DEFAULT_MANIFEST_URL = ''
const pollingInterval = 12000
const requestTimeoutMs = undefined
const accountFetchingConfigs = {
  addressSearchLimit: 1,
  numAddressesToReturn: 1,
  shouldAskForOnDeviceConfirmation: false,
}

const _signTypedData = (eip712Data: any) => {
  const path = "m/44'/60'/0'/0/"
  const activeIndex = 0

  const { domain_separator_hash, message_hash } = transformTypedData(eip712Data, true)

  return TrezorConnect.ethereumSignTypedData({
    path: path + activeIndex,
    metamask_v4_compat: true,
    domain_separator_hash,
    message_hash: message_hash || '',
    data: eip712Data,
  }).then((res) => {
    if (res.success === false) {
      throw new Error(res.payload.error)
    }

    return (res.payload as any).signature
  })
}

export class Trezor extends Connector {
  public provider?: any
  private readonly options: TrezorOptions

  constructor({
    actions,
    onError,
    options = {
      manifestAppUrl: DEFAULT_MANIFEST_URL,
      manifestEmail: DEFAULT_MANIFEST_EMAIL,
    },
  }: LedgerConstructorArgs) {
    super(actions, onError)

    this.options = options
  }

  async getAccounts() {
    const provider = await this.getProvider()
    const accounts = (await provider._providers[0].getAccountsAsync(1)) as string[]

    return accounts
  }

  async getChainId() {
    const provider = await this.getProvider()
    const chainId = (await provider?.request({
      method: 'eth_chainId',
    })) as string

    return parseChainId(chainId)
  }

  async getProvider(
    { forceCreate, networkId }: { networkId?: number; forceCreate?: boolean } = {
      forceCreate: false,
      networkId: 1,
    }
  ) {
    if (!this.provider || forceCreate) {
      TrezorConnect.manifest({
        email: this.options.manifestEmail,
        appUrl: this.options.manifestAppUrl,
      })

      const engine = new Web3ProviderEngine({ pollingInterval })
      const props = { trezorConnectClientApi: TrezorConnect, networkId, accountFetchingConfigs }

      engine.addProvider(new TrezorSubprovider(props))
      engine.addProvider(new RPCSubprovider(this.options.url, requestTimeoutMs))

      this.addRequest(engine)

      await engine.start()

      this.provider = engine
    }

    return this.provider
  }

  public async activate({ networkId }: { networkId: number }) {
    await this.getProvider({ forceCreate: true, networkId })
    await this.activateProvider()
  }

  async activateProvider() {
    if (!this.provider) return

    if (this.provider?.on) {
      this.provider.on('accountsChanged', this.onAccountsChanged)
      this.provider.on('chainChanged', this.onChainChanged)
      this.provider.on('disconnect', this.onDisconnect)
      this.provider.on('close', this.onDisconnect)
    }

    const accounts = await this.getAccounts()
    const chainId = await this.getChainId()

    return this.actions.update({ chainId, accounts })
  }

  protected onAccountsChanged = (accounts: string[]): void => {
    if (accounts.length === 0) {
      this.actions.resetState()
    } else {
      this.actions.update({ accounts })
    }
  }

  protected onChainChanged = (chainId: number | string): void => {
    this.actions.update({ chainId: parseChainId(chainId) })
  }

  protected onDisconnect = (error: any): void => {
    this.actions.resetState()
    this.onError?.(error)
  }

  protected addRequest(engine: any) {
    ;(engine as any)['request'] = function (request: any) {
      if (request.method === 'eth_signTypedData_v4') {
        const { domain, message, primaryType, types } = JSON.parse(request.params[1])
        return _signTypedData({ domain, types, message, primaryType })
      }

      return new Promise((resolve, reject) => {
        engine.sendAsync({ id: 1, jsonrpc: '2.0', ...request }, (error: any, result: any) => {
          const resultError = error

          if (resultError) {
            reject(resultError)
          } else {
            resolve(result.result)
          }
        })
      })
    }
  }

  // TODO: I think this is not possible because of the popup
  public async connectEagerly(): Promise<void> {}
}
