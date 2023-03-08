import { Actions, Connector, Provider } from '@web3-react/types'
import { LedgerProvider } from './provider'

interface LedgerConstructorArgs {
  actions: Actions
  onError?: () => void
  options?: LedgerOptions
}

export interface LedgerOptions {
  chainId?: number
  bridge?: string
  infuraId?: string
  rpc?: { [chainId: number]: string }
}

export class LedgerConnector extends Connector {
  public provider?: Provider
  private readonly options: LedgerOptions

  private isActivated = false

  private providerRequests: ((provider: Provider) => void)[] = []

  constructor({ actions, onError, options = {} }: LedgerConstructorArgs) {
    super(actions, onError)

    this.options = options
  }

  async getProvider(
    { forceCreate }: { chainId?: number; forceCreate?: boolean } = {
      forceCreate: false,
    }
  ): Promise<Provider> {
    if (!this.provider) {
      if (forceCreate) {
        this.activate()
      }

      return new Promise((resolve) => {
        this.providerRequests.push(resolve)
      })
    }

    return Promise.resolve(this.provider)
  }

  async getAccounts(): Promise<string[]> {
    const provider = await this.getProvider()
    return (await provider.request({
      method: 'eth_accounts',
    })) as string[]
  }

  async getChainId(): Promise<number> {
    const provider = await this.getProvider()
    const chainId = (await provider.request({
      method: 'net_version',
    })) as string

    return +chainId
  }

  async activate() {
    if (this.isActivated) return

    const provider = new LedgerProvider(this.options)

    const engine = await provider.activate()

    this.provider = engine as any
    this.providerRequests.forEach((callback) => {
      callback(engine as any)
    })
    this.providerRequests = []

    const accounts = await this.getAccounts()
    const chainId = await this.getChainId()

    this.isActivated = true

    return this.actions.update({ chainId, accounts })
  }

  async connectEagerly(): Promise<void> {
    return this.activate()
  }

  deactivate(...args: unknown[]): Promise<void> | void {
    this.isActivated = false

    return super.deactivate?.(...args)
  }
}
