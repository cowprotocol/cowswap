import { isInjectedWidget, isRejectRequestProviderError } from '@cowprotocol/common-utils'
import { WidgetEthereumProvider } from '@cowprotocol/iframe-transport'
import { Command } from '@cowprotocol/types'
import type { EIP1193Provider } from '@cowprotocol/types'
import { Actions, AddEthereumChainParameter, Connector, ProviderConnectInfo, ProviderRpcError } from '@web3-react/types'

interface injectedWalletConstructorArgs {
  actions: Actions
  onError?: Command
  walletUrl: string
  searchKeywords: string[]
}

export class InjectedWallet extends Connector {
  provider?: EIP1193Provider = undefined
  prevProvider?: EIP1193Provider = undefined
  walletUrl: string
  searchKeywords: string[]
  eagerConnection?: boolean

  onConnect?(provider: EIP1193Provider): void

  onDisconnect?: Command

  constructor({ actions, onError, walletUrl, searchKeywords }: injectedWalletConstructorArgs) {
    super(actions, onError)

    // Mod: we are passing these 2 custom props
    this.walletUrl = walletUrl
    this.searchKeywords = searchKeywords
  }

  /**
   * When desiredChainIdOrChainParameters is set it means this is a network switching request
   * We have to call startActivation() for switching between wallets, but we mustn't do it on network switch
   */
  async activate(desiredChainIdOrChainParameters?: number | AddEthereumChainParameter): Promise<void> {
    let cancelActivation: Command

    if (!desiredChainIdOrChainParameters || !this.provider?.isConnected?.()) {
      cancelActivation = this.actions.startActivation()
    }

    return this.isomorphicInitialize()
      .then(async () => {
        // Mod: If we can't find the specific provider we want, open the passed URL in new tab
        if (!this.provider) {
          window.open(this.walletUrl, '_blank')
          return
        }

        // Try to get accounts, if no accounts is returned (user rejected) throw error
        const accounts = await this.getAccounts()
        if (!accounts.length) throw new Error('No accounts returned')

        // Get chain ID from the wallet
        const chainId = (await this.provider.request({ method: 'eth_chainId' })) as string
        const receivedChainId = parseChainId(chainId)
        const desiredChainId =
          typeof desiredChainIdOrChainParameters === 'number' ? undefined : desiredChainIdOrChainParameters?.chainId

        // if there's no desired chain, or it's equal to the received, update
        if (!desiredChainId || receivedChainId === desiredChainId) {
          this.onConnect?.(this.provider)

          return this.actions.update({ chainId: receivedChainId, accounts })
        }

        const desiredChainIdHex = `0x${desiredChainId.toString(16)}`

        return (
          this.provider
            // TODO: Replace any with proper type definitions
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .request<any>({
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
            .then(() => {
              if (this.provider) {
                this.onConnect?.(this.provider)
              }
            })
        )
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

      if (!this.provider || this.eagerConnection) return cancelActivation()

      // Fix to call this only once
      this.eagerConnection = true

      // Wallets may resolve eth_chainId and hang on eth_accounts pending user interaction, which may include changing
      // chains; they should be requested serially, with accounts first, so that the chainId can settle.
      const accounts = await this.getAccounts()
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
    // We have a custom method to detect Injected provider based on passed keywords array
    const provider = this.detectProvider()

    if (provider) {
      // TODO: Add proper return type annotation
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      const doesProviderMatches = () => this.provider === provider

      provider.on('connect', (data: ProviderConnectInfo): void => {
        if (!data || !doesProviderMatches()) return

        const { chainId } = data
        this.actions.update({ chainId: parseChainId(chainId) })
      })

      const onDisconnect = (error: ProviderRpcError): void => {
        if (!doesProviderMatches()) return

        this.provider
          ?.request({ method: 'PUBLIC_disconnectSite' })
          .catch(() => console.log('Failed to call "PUBLIC_disconnectSite", ignoring'))

        this.deactivate()
        this.onError?.(error)
      }

      provider.on('disconnect', onDisconnect)
      provider.on('close', onDisconnect)

      provider.on('chainChanged', (chainId: string): void => {
        if (!doesProviderMatches()) return

        this.actions.update({ chainId: parseChainId(chainId) })
      })

      provider.on('accountsChanged', (accounts: string[]): void => {
        if (!doesProviderMatches()) return

        if (accounts.length === 0) {
          // When one of EIP6963 providers is disconnected try to switch to the previous one
          if (this.prevProvider && this.provider !== this.prevProvider) {
            this.provider = this.prevProvider
            this.prevProvider = undefined

            this.activate()
          } else {
            this.actions.resetState()
          }
        } else {
          this.actions.update({ accounts })
        }
      })
    }
  }

  async deactivate(): Promise<void> {
    if (this.provider) {
      this.provider.removeAllListeners('connect')
      this.provider.removeAllListeners('disconnect')
      this.provider.removeAllListeners('close')
      this.provider.removeAllListeners('chainChanged')
      this.provider.removeAllListeners('accountsChanged')
    }

    this.provider = undefined
    this.onDisconnect?.()
    this.actions.resetState()
  }

  // Mod: Added custom method
  // Method to target a specific provider on window.ethereum or window.ethereum.providers if it exists
  private detectProvider(): EIP1193Provider | void {
    if (this.provider) return this.provider

    if (isInjectedWidget()) {
      this.provider = new WidgetEthereumProvider() as EIP1193Provider
    } else {
      this.provider =
        this.detectOnEthereum(window.ethereum) || this.detectOnProvider(window.ethereum?.providers) || null
    }

    return this.provider
  }

  // Mod: Added custom method
  // Some wallets such as Tally will inject custom providers array on window.ethereum
  // This array will contain all injected providers and we can select the one we want based on keywords passed to constructor
  // For example to select tally we would search for isTally or isTallyWallet property keys
  // TODO: Add proper return type annotation
  // TODO: Replace any with proper type definitions
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-explicit-any
  private detectOnProvider(providers: any) {
    if (!providers) return null
    // TODO: Replace any with proper type definitions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return providers.find((provider: any) => this.searchKeywords.some((keyword) => provider[keyword]))
  }

  // Mod: Added custom method
  // Here we check for specific provider directly on window.ethereum
  // TODO: Add proper return type annotation
  // TODO: Replace any with proper type definitions
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-explicit-any
  private detectOnEthereum(ethereum?: any) {
    if (!ethereum) return null

    if (this.searchKeywords.length === 0) return ethereum

    const provider = this.searchKeywords.some((keyword) => ethereum[keyword])
    return provider ? ethereum : null
  }

  // Mod: Added custom method
  // Try 2 different RPC methods to get accounts first with eth_requestAccounts and if it fails, try eth_accounts
  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  public async getAccounts() {
    const { provider } = this

    if (!provider) {
      throw new Error('No provider')
    }

    try {
      const accounts = await provider.request({ method: 'eth_requestAccounts' })
      return accounts as string[]
    } catch (error) {
      if (isRejectRequestProviderError(error)) {
        throw error
      }

      console.debug(`
        Failed to get account with eth_requestAccounts method
        Trying with eth_accounts method
      `)

      return provider.request({ method: 'eth_accounts' }) as Promise<string[]>
    }
  }
}

function parseChainId(chainId: string | number): number {
  if (typeof chainId === 'number') return chainId

  if (!chainId.startsWith('0x')) {
    return Number(chainId)
  }

  return Number.parseInt(chainId, 16)
}
