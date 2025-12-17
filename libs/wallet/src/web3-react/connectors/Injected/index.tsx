import { isInjectedWidget, isRejectRequestProviderError } from '@cowprotocol/common-utils'
import { WidgetEthereumProvider } from '@cowprotocol/iframe-transport'
import { Command } from '@cowprotocol/types'
import type { EIP1193Provider } from '@cowprotocol/types'
import { Web3Provider } from '@ethersproject/providers'
import { Actions, AddEthereumChainParameter, Connector, ProviderConnectInfo, ProviderRpcError } from '@web3-react/types'

import { parseChainId } from '../../utils/parseChainId'

interface injectedWalletConstructorArgs {
  actions: Actions
  onError?: Command
  walletUrl: string
  searchKeywords: string[]
}

export class InjectedWallet extends Connector {
  provider?: EIP1193Provider = undefined
  prevProvider?: EIP1193Provider = undefined
  customProvider?: Web3Provider = undefined
  walletUrl: string
  searchKeywords: string[]
  eagerConnection?: boolean
  private chainIdRequest?: Promise<string | number>
  private usedMetadataFallback = false
  private syncIntervalId?: ReturnType<typeof setInterval>

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

        // Get chain ID from the wallet (retry on empty array from some providers during init)
        const chainId = await this.getChainIdWithRetry()
        const receivedChainId = parseChainId(chainId)
        const desiredChainId =
          typeof desiredChainIdOrChainParameters === 'number' ? undefined : desiredChainIdOrChainParameters?.chainId

        // if there's no desired chain, or it's equal to the received, update
        if (!desiredChainId || receivedChainId === desiredChainId) {
          this.onConnect?.(this.provider)

          this.actions.update({ chainId: receivedChainId, accounts })

          // Sync chainId from RPC after connection to ensure provider network is in sync
          // This is important when we used metadata fallback - the provider might become ready later
          this.syncChainIdAfterConnection()

          return
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
      // Get chain ID from the wallet (retry on empty array from some providers during init)
      const chainId = await this.getChainIdWithRetry()
      const receivedChainId = parseChainId(chainId)
      this.actions.update({ chainId: receivedChainId, accounts })

      // Sync chainId from RPC after connection to ensure provider network is in sync
      this.syncChainIdAfterConnection()
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

    // Clear sync interval if active
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId)
      this.syncIntervalId = undefined
    }

    this.provider = undefined
    this.usedMetadataFallback = false
    this.customProvider = undefined
    this.onDisconnect?.()
    this.actions.resetState()
  }

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

  // Get chainId with retry logic for providers that may return empty array during initialization.
  private async getChainIdWithRetry(maxRetries = 5): Promise<string | number> {
    if (this.chainIdRequest) return this.chainIdRequest

    const { provider } = this

    if (!provider) {
      throw new Error('No provider')
    }

    const run = async (): Promise<{ chainId: string | number; usedMetadata: boolean }> => {
      let lastError: unknown

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        let chainId: unknown

        try {
          chainId = await provider.request({ method: 'eth_chainId' })
        } catch (error) {
          console.debug('eth_chainId failed, checking metadata (will retry if unavailable)', error)
          lastError = error
          // When RPC throws an error, check metadata first; only retry if nothing usable is found
          const metaChainId = readMetaChainId(provider)
          if (metaChainId !== null) {
            const parsed = parseChainId(metaChainId)
            this.setCustomProvider(parsed)
            return { chainId: metaChainId, usedMetadata: true }
          }
        }

        // If we get a valid chainId from RPC, return it immediately (prioritize fresh response)
        if (typeof chainId === 'string' || typeof chainId === 'number') {
          // RPC succeeded; set custom provider so getNetwork() doesn't rely on further eth_chainId calls
          const parsed = parseChainId(chainId)
          this.setCustomProvider(parsed)
          return { chainId, usedMetadata: false }
        }

        // Empty array means provider is initializing - check metadata immediately (retrying won't help).
        // Note: This is the only case where we use cached metadata. Required for Brave wallet which
        // returns empty arrays during initialization but has the correct chainId in provider metadata.
        if (Array.isArray(chainId) && chainId.length === 0) {
          const metaChainId = readMetaChainId(provider)
          if (metaChainId !== null) {
            const parsed = parseChainId(metaChainId)
            this.setCustomProvider(parsed)
            return { chainId: metaChainId, usedMetadata: true }
          }
        }

        if (chainId !== undefined && !Array.isArray(chainId)) {
          lastError = new Error(
            `Invalid chainId: expected string or number, got ${typeof chainId}. Value: ${JSON.stringify(chainId)}`,
          )
        }

        if (attempt < maxRetries - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)))
        }
      }

      // After all retries failed, fall back to provider metadata as last resort
      const metaChainId = readMetaChainId(provider)
      if (metaChainId !== null) {
        const parsed = parseChainId(metaChainId)
        this.setCustomProvider(parsed)
        return { chainId: metaChainId, usedMetadata: true }
      }

      if (lastError instanceof Error) {
        throw lastError
      }

      throw new Error(`Failed to get chainId after ${maxRetries} attempts. Provider did not return a usable chainId.`)
    }

    this.chainIdRequest = run()
      .then(({ chainId, usedMetadata }) => {
        // Track if we used metadata fallback
        this.usedMetadataFallback = usedMetadata
        return chainId
      })
      .finally(() => {
        this.chainIdRequest = undefined
      })

    return this.chainIdRequest
  }

  // Sync chainId from RPC after connection when metadata fallback was used
  // Keeps retrying until RPC succeeds to ensure provider.getNetwork() works correctly
  private syncChainIdAfterConnection(): void {
    if (!this.provider || !this.usedMetadataFallback) return

    // Clear any existing sync interval
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId)
    }

    let attempt = 0
    const maxSyncAttempts = 10 // Retry for up to ~30 seconds
    const syncDelay = 3000 // 3 seconds between attempts

    const trySync = async (): Promise<void> => {
      if (!this.provider || attempt >= maxSyncAttempts) {
        if (this.syncIntervalId) {
          clearInterval(this.syncIntervalId)
          this.syncIntervalId = undefined
        }
        return
      }

      attempt++

      try {
        const rpcChainId = await this.provider.request({ method: 'eth_chainId' })
        if (typeof rpcChainId === 'string' || typeof rpcChainId === 'number') {
          const parsedRpcChainId = parseChainId(rpcChainId)
          // Recreate custom provider with the real chainId to ensure getNetwork works
          this.setCustomProvider(parsedRpcChainId)
          // Trigger state update so hooks pick up the new provider
          this.actions.update({ chainId: parsedRpcChainId })
          // RPC succeeded, clear metadata flag and stop syncing
          this.usedMetadataFallback = false
          if (this.syncIntervalId) {
            clearInterval(this.syncIntervalId)
            this.syncIntervalId = undefined
          }
          console.debug('Post-connection chainId sync succeeded, RPC chainId:', parsedRpcChainId)
        }
      } catch (error) {
        // RPC still failing, will retry on next interval
        if (attempt < maxSyncAttempts) {
          console.debug(`Post-connection chainId sync attempt ${attempt} failed, will retry`, error)
        } else {
          console.debug('Post-connection chainId sync exhausted all attempts, keeping metadata chainId', error)
        }
      }
    }

    // Start syncing after initial delay, then retry periodically
    setTimeout(() => {
      trySync()
      this.syncIntervalId = setInterval(trySync, syncDelay)
    }, 1000)
  }

  private setCustomProvider(chainId: number): void {
    if (!this.provider) return
    this.customProvider = new Web3Provider(this.provider, chainId)
  }
}

// Some injected providers stash the chainId in non-standard fields; check common spots as a last resort fallback.
function readMetaChainId(provider: EIP1193Provider): string | number | null {
  const candidates = [
    (provider as { chainId?: unknown }).chainId,
    (provider as { networkVersion?: unknown }).networkVersion,
    (provider as { provider?: { chainId?: unknown } }).provider?.chainId,
    (provider as { _state?: { chainId?: unknown; network?: { chainId?: unknown } } })._state?.chainId,
    (provider as { _state?: { chainId?: unknown; network?: { chainId?: unknown } } })._state?.network?.chainId,
    (provider as { session?: { chainId?: unknown } }).session?.chainId,
  ]

  for (const candidate of candidates) {
    if (candidate === undefined) continue
    if (typeof candidate === 'string' || typeof candidate === 'number') return candidate
  }

  return null
}
