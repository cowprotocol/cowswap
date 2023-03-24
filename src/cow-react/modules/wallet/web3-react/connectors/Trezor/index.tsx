import { Actions, Connector } from '@web3-react/types'
import Web3ProviderEngine from 'web3-provider-engine'
import TrezorConnect from '@trezor/connect-web'

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

  manifestEmail?: string
  manifestAppUrl?: string
}

function parseChainId(chainId: number | string) {
  return Number.parseInt(String(chainId), 16)
}

const url = 'https://mainnet.infura.io/v3/1ef55d552de6419386f927559b13e052'
const manifestEmail = 'dummy@abc.xyz'
const manifestAppUrl = 'http://localhost:3000'
const pollingInterval = 12000
const requestTimeoutMs = undefined
const accountFetchingConfigs = {
  addressSearchLimit: 1,
  numAddressesToReturn: 1,
  shouldAskForOnDeviceConfirmation: false,
}

const _signTypedData = ({ types, domain, message, primaryType }: any) => {
  return TrezorConnect.ethereumSignTypedData({
    path: "m/44'/60'/0'/0/0",
    metamask_v4_compat: true,
    data: {
      types,
      domain,
      message,
      primaryType,
    },
    domain_separator_hash: '0x6192106f129ce05c9075d319c1fa6ea9b3ae37cbd0c1ef92e2be7137bb07baa1',
  })
}

export class Trezor extends Connector {
  public provider?: any
  private readonly options: TrezorOptions
  private trezorConnect?: typeof TrezorConnect

  constructor({ actions, onError, options = {} }: LedgerConstructorArgs) {
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
        email: manifestEmail,
        appUrl: manifestAppUrl,
      })

      const engine = new Web3ProviderEngine({ pollingInterval })
      const props = { trezorConnectClientApi: TrezorConnect, networkId, accountFetchingConfigs }

      engine.addProvider(new TrezorSubprovider(props))
      engine.addProvider(new RPCSubprovider(url, requestTimeoutMs))
      ;(window as any)['provider'] = engine

      this.assignRequest(engine)

      await engine.start()

      this.provider = engine
    }

    return this.provider
  }

  async getSigner() {}

  public async activate({ networkId }: { networkId: number }) {
    const provider = await this.getProvider({ forceCreate: true, networkId })

    if (provider?.on) {
      console.log('debug assigning event handlers')
      provider.on('accountsChanged', this.onAccountsChanged)
      provider.on('chainChanged', this.onChainChanged)
      provider.on('disconnect', this.onDisconnect)
      provider.on('close', this.onDisconnect)
    }

    const accounts = await this.getAccounts()
    const chainId = await this.getChainId()

    return this.actions.update({ chainId, accounts })
  }

  public async connectEagerly(): Promise<void> {}

  protected onAccountsChanged = (accounts: string[]): void => {
    console.log('debug accounts changed', accounts)

    if (accounts.length === 0) {
      this.actions.resetState()
    } else {
      this.actions.update({ accounts })
    }
  }

  protected onChainChanged = (chainId: number | string): void => {
    console.log('debug chain changed')

    this.actions.update({ chainId: parseChainId(chainId) })
  }

  protected onDisconnect = (error: any): void => {
    this.actions.resetState()
    this.onError?.(error)
  }

  protected assignRequest(engine: any) {
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
}
