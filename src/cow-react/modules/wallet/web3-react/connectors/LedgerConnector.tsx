import {
  Actions,
  // AddEthereumChainParameter,
  Connector,
  Provider,
  // ProviderConnectInfo,
  // ProviderRpcError,
  RequestArguments,
} from '@web3-react/types'

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

function parseChainId(chainId: string) {
  return Number.parseInt(chainId, 16)
}

export class Ledger extends Connector {
  public provider?: LedgerProvider
  private readonly options?: LedgerOptions
  private eagerConnection?: Promise<void>

  constructor({ actions, onError, options }: LedgerConstructorArgs) {
    super(actions, onError)
    this.options = options
  }

  public async activate() {
    const cancelActivation = this.actions.startActivation()

    return this.isomorphicInitialize()
      .then(async () => {
        if (!this.provider) return

        const accounts = (await this.provider.request({ method: 'eth_requestAccounts' })) as string[]
        const chainId = (await this.provider.request({ method: 'eth_chainId' })) as string

        return this.actions.update({ chainId: parseChainId(chainId), accounts })
      })
      .catch((error) => {
        cancelActivation()
        throw error
      })
  }

  public async connectEagerly(): Promise<void> {
    const cancelActivation = this.actions.startActivation()

    try {
      await this.isomorphicInitialize()

      if (!this.provider) return cancelActivation()

      const accounts = (await this.provider.request({ method: 'eth_accounts' })) as string[]

      if (!accounts.length) throw new Error('No accounts returned')

      const chainId = (await this.provider.request({ method: 'eth_chainId' })) as string

      this.actions.update({ chainId: parseChainId(chainId), accounts })
    } catch (error) {
      console.debug('Could not connect eagerly', error)
      this.actions.resetState()
    }
  }

  private async isomorphicInitialize(): Promise<void> {
    if (this.eagerConnection) return

    return (this.eagerConnection = import('@ledgerhq/connect-kit-loader').then(async (m) => {
      const { loadConnectKit, SupportedProviders } = m

      const connectKit = await loadConnectKit()

      connectKit.enableDebugLogs()

      connectKit.checkSupport({
        providerType: SupportedProviders.Ethereum,
        chainId: this.options?.chainId || 0x1,
        infuraId: this.options?.infuraId,
        rpc: this.options?.rpc,
      })

      this.provider = (await connectKit.getProvider()) as LedgerProvider

      if (this.provider) {
        this.provider.on('connect', ({ chainId }): void => {
          this.actions.update({ chainId: parseChainId(chainId) })
        })

        this.provider.on('disconnect', (error): void => {
          if (error.code === 1013) {
            console.debug('Ledger logged connection error 1013: "Try again later"')
            return
          }

          this.actions.resetState()
          this.onError?.(error)
        })

        this.provider.on('chainChanged', (chainId: string): void => {
          this.actions.update({ chainId: parseChainId(chainId) })
        })

        this.provider.on('accountsChanged', (accounts: string[]): void => {
          if (accounts.length === 0) {
            this.actions.resetState()
          } else {
            this.actions.update({ accounts })
          }
        })
      }
    }))
  }
}
