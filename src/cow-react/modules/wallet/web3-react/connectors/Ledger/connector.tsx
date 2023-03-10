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

enum Errors {
  NOT_CONNECTED = 'Please make sure you are connected to Ethereun network on your Ledger device and try again!',
  NOT_UNLOCKED = 'Please unlock your ledger device first and try again!',
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

    try {
      const provider = new LedgerProvider(this.options)

      const engine = (await provider.activate()) as unknown as Provider

      this.provider = engine
      this.providerRequests.forEach((callback) => {
        callback(engine)
      })
      this.providerRequests = []

      const accounts = await this.getAccounts()
      const chainId = await this.getChainId()

      this.isActivated = true

      return this.actions.update({ chainId, accounts })
    } catch (error) {
      if (error.statusCode === 25873) {
        throw Error(Errors.NOT_CONNECTED)
      }

      if (error.statusCode === 21781) {
        throw Error(Errors.NOT_UNLOCKED)
      }

      throw error
    }
  }

  async connectEagerly(): Promise<void> {
    return this.activate()
  }

  deactivate(...args: unknown[]): Promise<void> | void {
    this.isActivated = false

    return super.deactivate?.(...args)
  }
}
