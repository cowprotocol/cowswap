import { Actions, Connector, Provider } from '@web3-react/types'
import Web3ProviderEngine from 'web3-provider-engine'
import TrezorConnect from '@trezor/connect-web'

global.process = { browser: true } as any
const TrezorSubprovider = require('@0x/subproviders/lib/src/subproviders/trezor').TrezorSubprovider
const RPCSubprovider = require('@0x/subproviders/lib/src/subproviders/rpc_subprovider').RPCSubprovider

console.log('debug', TrezorSubprovider, RPCSubprovider)

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

export class Trezor extends Connector {
  public provider?: Provider
  private readonly options: TrezorOptions

  constructor({ actions, onError, options = {} }: LedgerConstructorArgs) {
    super(actions, onError)

    this.options = options
  }

  // async getAccounts() {
  //   console.log('getAccount')

  //   const provider = await this.getProvider()
  //   const accounts = (await provider.request({
  //     method: 'eth_requestAccounts',
  //   })) as string[]

  //   return accounts
  // }

  // async getChainId() {
  //   console.log('getChainId')

  //   const provider = await this.getProvider()
  //   const chainId = (await provider.request({
  //     method: 'eth_chainId',
  //   })) as string

  //   return parseChainId(chainId)
  // }

  async getProvider(
    { forceCreate }: { chainId?: number; forceCreate?: boolean } = {
      forceCreate: false,
    }
  ) {
    if (!this.provider) {
      TrezorConnect.manifest({
        email: manifestEmail,
        appUrl: manifestAppUrl,
      })

      const engine = new Web3ProviderEngine({ pollingInterval })
      const props = { trezorConnectClientApi: TrezorConnect, networkId: 1, accountFetchingConfigs }

      engine.addProvider(new TrezorSubprovider(props))
      engine.addProvider(new RPCSubprovider(url, requestTimeoutMs))

      engine.start()
      ;(window as any)['engine'] = engine
    }

    return this.provider
  }

  async getSigner() {}

  public async activate() {
    console.log('debug activate')

    try {
      const provider = await this.getProvider({ forceCreate: true })
    } catch (err) {
      console.log('debug err', err)
    }

    // if (provider?.on) {
    //   console.log('debug assigning event handlers')
    //   provider.on('accountsChanged', this.onAccountsChanged)
    //   provider.on('chainChanged', this.onChainChanged)
    //   provider.on('disconnect', this.onDisconnect)
    //   provider.on('close', this.onDisconnect)
    // }

    // const accounts = await this.getAccounts()
    // const chainId = await this.getChainId()

    // return this.actions.update({ chainId, accounts })
  }

  // public async connectEagerly(): Promise<void> {}

  // protected onAccountsChanged = (accounts: string[]): void => {
  //   console.log('debug accounts changed', accounts)

  //   if (accounts.length === 0) {
  //     this.actions.resetState()
  //   } else {
  //     this.actions.update({ accounts })
  //   }
  // }

  // protected onChainChanged = (chainId: number | string): void => {
  //   console.log('debug chain changed')

  //   this.actions.update({ chainId: parseChainId(chainId) })
  // }

  // protected onDisconnect = (error: any): void => {
  //   this.actions.resetState()
  //   this.onError?.(error)
  // }
}
