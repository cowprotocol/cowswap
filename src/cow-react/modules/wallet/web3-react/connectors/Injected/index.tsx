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
  on: (event: string, args: unknown) => unknown
}

interface injectedWalletConstructorArgs {
  actions: Actions
  onError?: () => void
  walletUrl: string
  searchKeywords: string[]
}

function parseChainId(chainId: string) {
  return Number.parseInt(chainId, 16)
}

export class InjectedWallet extends Connector {
  provider?: InjectedWalletProvider
  walletUrl: string
  searchKeywords: string[]

  constructor({ actions, onError, walletUrl, searchKeywords }: injectedWalletConstructorArgs) {
    super(actions, onError)

    // Mod: we are passing these 2 custom props
    this.walletUrl = walletUrl
    this.searchKeywords = searchKeywords
  }

  // Based on https://github.com/Uniswap/web3-react/blob/de97c00c378b7909dfbd8a06558ed12e1f796caa/packages/metamask/src/index.ts#L130 with some changes
  async activate(desiredChainIdOrChainParameters?: number | AddEthereumChainParameter): Promise<void> {
    let cancelActivation: () => void
    if (!this.provider?.isConnected?.()) cancelActivation = this.actions.startActivation()

    return this.isomorphicInitialize()
      .then(async () => {
        // Mod: If we can't find the specific provider we want, open the passed URL in new tab
        if (!this.provider) {
          window.open(this.walletUrl, '_blank')
          return
        }

        // Wallets may resolve eth_chainId and hang on eth_accounts pending user interaction, which may include changing
        // chains; they should be requested serially, with accounts first, so that the chainId can settle.
        const accounts = (await this.provider.request({ method: 'eth_requestAccounts' })) as string[]
        const chainId = (await this.provider.request({ method: 'eth_chainId' })) as string
        const receivedChainId = parseChainId(chainId)
        const desiredChainId =
          typeof desiredChainIdOrChainParameters === 'number'
            ? desiredChainIdOrChainParameters
            : desiredChainIdOrChainParameters?.chainId

        // if there's no desired chain, or it's equal to the received, update
        if (!desiredChainId || receivedChainId === desiredChainId)
          return this.actions.update({ chainId: receivedChainId, accounts })

        const desiredChainIdHex = `0x${desiredChainId.toString(16)}`

        // if we're here, we can try to switch networks
        return this.provider
          .request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: desiredChainIdHex }],
          })
          .catch((error: ProviderRpcError) => {
            if (error.code === 4902 && typeof desiredChainIdOrChainParameters !== 'number') {
              if (!this.provider) throw new Error('No provider')
              // if we're here, we can try to add a new network
              return this.provider.request({
                method: 'wallet_addEthereumChain',
                params: [{ ...desiredChainIdOrChainParameters, chainId: desiredChainIdHex }],
              })
            }

            throw error
          })
          .then(() => this.activate(desiredChainId))
      })
      .catch((error: Error) => {
        cancelActivation?.()
        throw error
      })
  }

  // Copied from https://github.com/Uniswap/web3-react/blob/de97c00c378b7909dfbd8a06558ed12e1f796caa/packages/metamask/src/index.ts#L98
  /** {@inheritdoc Connector.connectEagerly} */
  async connectEagerly(): Promise<void> {
    const cancelActivation = this.actions.startActivation()

    try {
      await this.isomorphicInitialize()
      if (!this.provider) return cancelActivation()

      // Wallets may resolve eth_chainId and hang on eth_accounts pending user interaction, which may include changing
      // chains; they should be requested serially, with accounts first, so that the chainId can settle.
      const accounts = (await this.provider.request({ method: 'eth_accounts' })) as string[]
      if (!accounts.length) throw new Error('No accounts returned')
      const chainId = (await this.provider.request({ method: 'eth_chainId' })) as string
      this.actions.update({ chainId: parseChainId(chainId), accounts })
    } catch (error) {
      console.debug('Could not connect eagerly', error)
      // we should be able to use `cancelActivation` here, but on mobile, metamask emits a 'connect'
      // event, meaning that chainId is updated, and cancelActivation doesn't work because an intermediary
      // update has occurred, so we reset state instead
      this.actions.resetState()
    }
  }

  // Based on https://github.com/Uniswap/web3-react/blob/de97c00c378b7909dfbd8a06558ed12e1f796caa/packages/metamask/src/index.ts#L54 with some changes
  private async isomorphicInitialize(): Promise<void> {
    // Mod: we have a custom method to detect a Injected provider based on passed keywords array
    const provider = this.detectProvider()

    if (provider) {
      provider.on('connect', ({ chainId }: ProviderConnectInfo): void => {
        this.actions.update({ chainId: parseChainId(chainId) })
      })

      provider.on('disconnect', (error: ProviderRpcError): void => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.provider?.request({ method: 'PUBLIC_disconnectSite' })

        this.actions.resetState()
        this.onError?.(error)
      })

      provider.on('chainChanged', (chainId: string): void => {
        this.actions.update({ chainId: Number(chainId) })
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

  // Mod: Added custom method
  // Just reset state on deactivate
  async deactivate(): Promise<void> {
    this.actions.resetState()
  }

  // Mod: Added custom method
  // Method to target a specific provider on window.ethereum or window.ethereum.providers if it exists
  private detectProvider(): InjectedWalletProvider | void {
    this.provider = this.detectOnEthereum(window.ethereum) || this.detectOnProvider(window.ethereum?.providers) || null
    return this.provider
  }

  // Mod: Added custom method
  // Some wallets such as Tally will inject custom providers array on window.ethereum
  // This array will contain all injected providers and we can select the one we want based on keywords passed to constructor
  // For example to select tally we would search for isTally or isTallyWallet property keys
  private detectOnProvider(providers: any) {
    if (!providers) return null
    return providers.find((provider: any) => this.searchKeywords.some((keyword) => provider[keyword]))
  }

  // Mod: Added custom method
  // Here we check for specific provider directly on window.ethereum
  private detectOnEthereum(ethereum?: any) {
    if (!ethereum) return null
    const provider = this.searchKeywords.some((keyword) => ethereum[keyword])
    return provider ? ethereum : null
  }
}
