import {
  Actions,
  // AddEthereumChainParameter,
  Connector,
  Provider,
  // ProviderConnectInfo,
  // ProviderRpcError,
  RequestArguments,
} from '@web3-react/types'
import { Web3Provider, ExternalProvider } from '@ethersproject/providers'

import { loadConnectKit, LedgerConnectKit, SupportedProviders } from '@ledgerhq/connect-kit-loader'

type LedgerProvider = Provider & {
  connected: () => boolean
  request<T>(args: RequestArguments): Promise<T>
}

interface LedgerConstructorArgs {
  actions: Actions
  onError?: () => void
  options?: LedgerOptions
}

interface LedgerOptions {
  chainId?: number
  bridge?: string
  infuraId?: string
  rpc?: { [chainId: number]: string }
}

function parseChainId(chainId: number | string) {
  return Number.parseInt(String(chainId), 16)
}

export class Ledger extends Connector {
  public provider?: LedgerProvider
  private readonly options: LedgerOptions
  private eagerConnection?: Promise<void>
  private connectKitPromise: Promise<LedgerConnectKit>

  constructor({ actions, onError, options = {} }: LedgerConstructorArgs) {
    super(actions, onError)

    this.options = options
    this.connectKitPromise = loadConnectKit()
  }

  async getAccounts() {
    console.log('getAccount')

    const provider = await this.getProvider()
    const accounts = (await provider.request({
      method: 'eth_requestAccounts',
    })) as string[]

    return accounts
  }

  async getChainId() {
    console.log('getChainId')

    const provider = await this.getProvider()
    const chainId = (await provider.request({
      method: 'eth_chainId',
    })) as string

    return parseChainId(chainId)
  }

  async getProvider(
    { forceCreate }: { chainId?: number; forceCreate?: boolean } = {
      forceCreate: false,
    }
  ) {
    console.log('getProvider')

    if (!this.provider || forceCreate) {
      console.log('getting provider from Connect Kit')
      const connectKit = await this.connectKitPromise
      this.provider = (await connectKit.getProvider()) as LedgerProvider
    }

    return this.provider
  }

  async getSigner() {
    console.log('getSigner')

    const [provider, account] = await Promise.all([this.getProvider(), this.getAccounts()])
    return new Web3Provider(provider as ExternalProvider).getSigner(account[0])
  }

  public async activate() {
    console.log('debug activate')

    const connectKit = await this.connectKitPromise

    connectKit.enableDebugLogs()

    connectKit.checkSupport({
      providerType: SupportedProviders.Ethereum,
      chainId: this.options.chainId,
      infuraId: this.options.infuraId,
      rpc: this.options.rpc,
    })

    const provider = await this.getProvider({ forceCreate: true })

    console.log('debug provider', this.provider)

    if (provider.on) {
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
}
