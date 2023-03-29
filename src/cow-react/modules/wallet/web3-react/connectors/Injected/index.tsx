import {
  Actions,
  AddEthereumChainParameter,
  Connector,
  Provider,
  ProviderConnectInfo,
  ProviderRpcError,
  RequestArguments,
} from '@web3-react/types'

type InjectedWalletProvider = Provider & {
  providers?: Omit<InjectedWalletProvider, 'providers'>[]
  isConnected: () => boolean
  request<T>(args: RequestArguments): Promise<T>
  chainId: string
  selectedAddress: string
  on: (event: string, args: any) => any

  enable?: () => void
  isTrust?: boolean
}

interface injectedWalletConstructorArgs {
  actions: Actions
  onError?: () => void
  walletUrl: string
  searchKeywords: string[]
}

type Window = typeof Window & {
  ethereum?: InjectedWalletProvider
  injectedwallet?: InjectedWalletProvider
}

export class InjectedWallet extends Connector {
  provider?: InjectedWalletProvider
  walletUrl: string
  searchKeywords: string[]

  private get connected() {
    return !!this.provider?.isConnected()
  }

  constructor({ actions, onError, walletUrl, searchKeywords }: injectedWalletConstructorArgs) {
    super(actions, onError)

    this.walletUrl = walletUrl
    this.searchKeywords = searchKeywords

    this.detectProvider()
  }

  public activate(desiredChainIdOrChainParameters?: number | AddEthereumChainParameter): Promise<void> | undefined {
    if (!this.provider) {
      window.open(this.walletUrl, '_blank')
      return
    }

    const desiredChainId =
      typeof desiredChainIdOrChainParameters === 'number'
        ? desiredChainIdOrChainParameters
        : desiredChainIdOrChainParameters?.chainId

    return Promise.all([this.provider.request({ method: 'eth_chainId' }) as Promise<string>, this.getAccounts()]).then(
      ([chainId, accounts]) => {
        const receivedChainId = this.parseChainId(chainId)

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        if (!desiredChainId || desiredChainId === receivedChainId) {
          return this.actions.update({ chainId: receivedChainId, accounts })
        }

        const desiredChainIdHex = `0x${desiredChainId.toString(16)}`

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.provider!.request<void>({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: desiredChainIdHex }],
        }).catch(async (error: ProviderRpcError) => {
          console.log('err!', error)
          console.log('debug err', error)

          if (error.code === 4902 && typeof desiredChainIdOrChainParameters !== 'number') {
            // if we're here, we can try to add a new network
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return this.provider!.request<void>({
              method: 'wallet_addEthereumChain',
              params: [{ ...desiredChainIdOrChainParameters, chainId: desiredChainIdHex }],
            })
          }

          throw error
        })
      }
    )
  }

  public async getAccounts() {
    const { provider } = this

    if (!provider) {
      return []
    }

    try {
      const accounts = await provider.request({ method: 'eth_requestAccounts' })

      return accounts as string[]
    } catch (e) {
      console.log('Failed to get account with eth_requestAccounts method')

      return provider.request({ method: 'eth_accounts' }) as Promise<string[]>
    }
  }

  /** {@inheritdoc Connector.connectEagerly} */
  public async connectEagerly(): Promise<void> {
    this.isomorphicInitialize()

    if (!this.provider) return

    if (this.provider.isTrust) {
      await this.provider.enable?.()
    }

    return Promise.all([this.provider.request({ method: 'eth_chainId' }) as Promise<string>, this.getAccounts()])
      .then(([chainId, accounts]) => {
        if (accounts.length) {
          this.actions.update({ chainId: this.parseChainId(chainId), accounts })
        } else {
          throw new Error('No accounts returned')
        }
      })
      .catch((error) => {
        console.debug('Could not connect eagerly', error)
        this.actions.resetState()
      })
  }

  private detectProvider(): InjectedWalletProvider | void {
    const w = window as unknown as Window

    this.provider = this.detectOnEthereum(w.ethereum) || this.detectOnProvider(w.ethereum?.providers) || null
    ;(window as any)['provider'] = this.provider

    return this.provider
  }

  private detectOnProvider(providers: any) {
    if (!providers) return null

    return providers.find((provider: any) => this.searchKeywords.some((keyword) => provider[keyword]))
  }

  private detectOnEthereum(ethereum?: any) {
    if (!ethereum) return null

    const provider = this.searchKeywords.some((keyword) => ethereum[keyword])

    return provider ? ethereum : null
  }

  private isomorphicInitialize(): void {
    const provider = this.detectProvider()

    if (provider) {
      provider.on('connect', ({ chainId }: ProviderConnectInfo): void => {
        this.actions.update({ chainId: this.parseChainId(chainId) })
      })

      provider.on('disconnect', (error: ProviderRpcError): void => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.provider?.request({ method: 'PUBLIC_disconnectSite' })

        this.actions.resetState()
        this.onError?.(error)
      })

      provider.on('chainChanged', (chainId: string): void => {
        this.actions.update({ chainId: this.parseChainId(chainId) })
      })

      provider.on('accountsChanged', (accounts: string[]): void => {
        if (accounts.length === 0) {
          this.actions.resetState()
        } else {
          this.actions.update({ accounts })
        }
      })
    }
  }

  private parseChainId(chainId: string) {
    if (!chainId.startsWith('0x')) {
      return Number(chainId)
    }

    return Number.parseInt(chainId, 16)
  }

  public async deactivate(): Promise<void> {
    this.actions.resetState()
  }
}
