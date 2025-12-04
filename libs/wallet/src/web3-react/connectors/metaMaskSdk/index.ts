import type {
  Actions,
  AddEthereumChainParameter,
  Provider,
  ProviderConnectInfo,
  ProviderRpcError,
  WatchAssetParameters,
} from '@web3-react/types'
import { Connector } from '@web3-react/types'

import type { MetaMaskSDK as _MetaMaskSDK, MetaMaskSDKOptions as _MetaMaskSDKOptions, SDKProvider } from '@metamask/sdk'

/**
 * MetaMaskSDK options.
 */
type MetaMaskSDKOptions = Pick<_MetaMaskSDKOptions, 'infuraAPIKey' | 'readonlyRPCMap'> & {
  dappMetadata: Pick<_MetaMaskSDKOptions['dappMetadata'], 'name' | 'url' | 'iconUrl'>
}

/**
 * Listener type for MetaMaskSDK events.
 */
type Listener = Parameters<Provider['on']>[1]

/**
 * Error thrown when the MetaMaskSDK is not installed.
 */
export class NoMetaMaskSDKError extends Error {
  public constructor() {
    super('MetaMaskSDK not installed')
    this.name = NoMetaMaskSDKError.name
    Object.setPrototypeOf(this, NoMetaMaskSDKError.prototype)
  }
}

/**
 * Parses a chainId from a string or number.
 */
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function parseChainId(chainId: string | number) {
  return typeof chainId === 'number' ? chainId : Number.parseInt(chainId, chainId.startsWith('0x') ? 16 : 10)
}

/**
 * @param options - Options to pass to `@metamask/sdk`
 * @param onError - Handler to report errors thrown from eventListeners.
 */
export interface MetaMaskSDKConstructorArgs {
  actions: Actions
  options?: MetaMaskSDKOptions
  onError?: (error: Error) => void
}

/**
 * Connector for the MetaMaskSDK.
 */
export class MetaMaskSDK extends Connector {
  private sdk?: _MetaMaskSDK
  provider?: SDKProvider = undefined
  private readonly options: MetaMaskSDKOptions
  private eagerConnection?: Promise<void>

  /**
   * @inheritdoc Connector.constructor
   */
  constructor({ actions, options, onError }: MetaMaskSDKConstructorArgs) {
    super(actions, onError)

    const defaultUrl = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}` : ''

    this.options = {
      ...options,
      dappMetadata: options?.dappMetadata ?? {
        url: defaultUrl,
        name: defaultUrl !== '' ? undefined : 'wagmi',
      },
    }
  }

  /**
   * Indicates whether the user is connected to the MetaMaskSDK.
   */
  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private async isConnected() {
    try {
      if (this.provider?.isConnected?.() === true) {
        if (this.sdk?.isExtensionActive() === true) {
          const accounts = ((await this.provider?.request({ method: 'eth_accounts' })) ?? []) as string[]
          return accounts.length > 0
        }

        return true
      }
    } catch {
      // ignore
    }

    return false
  }

  /**
   * @inheritdoc Connector.isomorphicInitialize
   */
  private async isomorphicInitialize(): Promise<void> {
    if (this.eagerConnection) return

    return (this.eagerConnection = import('@metamask/sdk').then(async (m) => {
      if (!this.sdk) {
        this.sdk = new m.default({
          _source: 'web3React',
          useDeeplink: true,
          injectProvider: false,
          forceInjectProvider: false,
          forceDeleteProvider: false,
          ...this.options,
        })
        await this.sdk.init()
      }

      this.provider = this.sdk.getProvider()!

      this.provider.on('connect', (({ chainId }: ProviderConnectInfo): void => {
        this.actions.update({ chainId: parseChainId(chainId) })
      }) as Listener)

      this.provider.on('disconnect', (async (error: ProviderRpcError): Promise<void> => {
        // TODO: Replace any with proper type definitions
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const originalError = ((error.data as any)?.originalError ?? error) as ProviderRpcError

        // If MetaMask emits a `code: 1013` error, wait for reconnection before disconnecting
        // https://github.com/MetaMask/providers/pull/120
        if (error && originalError.code === 1013 && this.provider) {
          const accounts = (await this.provider.request({ method: 'eth_accounts' })) as string[]
          if (accounts.length > 0) return
        }

        this.clearCache()

        this.actions.resetState()
        this.onError?.(error)
      }) as Listener)

      this.provider.on('chainChanged', ((chainId: string): void => {
        this.actions.update({ chainId: parseChainId(chainId) })
      }) as Listener)

      this.provider.on('accountsChanged', ((accounts: string[]): void => {
        // Disconnect if there are no accounts
        if (accounts.length === 0) {
          // ... and using browser extension
          if (this.sdk?.isExtensionActive()) {
            this.clearCache()
            this.actions.resetState()
          }
          // FIXME(upstream): Mobile app sometimes emits invalid `accountsChanged` event with empty accounts array
          else return
        } else {
          this.actions.update({ accounts })
        }
      }) as Listener)
    }))
  }

  /**
   * @inheritdoc Connector.connectEagerly
   */
  public async connectEagerly(): Promise<void> {
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
    } catch {
      // we should be able to use `cancelActivation` here, but on mobile, metamask emits a 'connect'
      // event, meaning that chainId is updated, and cancelActivation doesn't work because an intermediary
      // update has occurred, so we reset state instead
      this.actions.resetState()
    }
  }

  /**
   * Initiates a connection.
   *
   * @param desiredChainIdOrChainParameters - If defined, indicates the desired chain to connect to. If the user is
   * already connected to this chain, no additional steps will be taken. Otherwise, the user will be prompted to switch
   * to the chain, if one of two conditions is met: either they already have it added in their extension, or the
   * argument is of type AddEthereumChainParameter, in which case the user will be prompted to add the chain with the
   * specified parameters first, before being prompted to switch.
   */
  public async activate(desiredChainIdOrChainParameters?: number | AddEthereumChainParameter): Promise<void> {
    const [desiredChainId, desiredChain] =
      typeof desiredChainIdOrChainParameters === 'number'
        ? [desiredChainIdOrChainParameters, undefined]
        : [desiredChainIdOrChainParameters?.chainId, desiredChainIdOrChainParameters]

    // If user already connected, only switch chain
    if (this.provider && (await this.isConnected())) {
      await this.switchChain(desiredChainId, desiredChain)
      return
    }

    // If user not connected, connect eagerly
    // Then switch chain
    const cancelActivation = this.actions.startActivation()
    return this.isomorphicInitialize()
      .then(async () => {
        if (!this.provider || !this.sdk) throw new NoMetaMaskSDKError()

        const accounts = await this.sdk.connect()
        const currentChainIdHex = (await this.provider.request({ method: 'eth_chainId' })) as string
        const currentChainId = parseChainId(currentChainIdHex)

        await this.actions.update({ chainId: currentChainId, accounts })
      })
      .catch((error) => {
        cancelActivation?.()
        throw error
      })
  }

  /**
   * @inheritdoc Connector.deactivate
   */
  public deactivate(): void {
    this.sdk?.terminate()
  }

  /**
   * Watches an asset in the MetaMask wallet.
   */
  public async watchAsset({ address, symbol, decimals, image }: WatchAssetParameters): Promise<true> {
    if (!this.provider) throw new NoMetaMaskSDKError()

    return this.provider
      .request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20', // Initially only supports ERC20, but eventually more!
          options: {
            address, // The address that the token is at.
            symbol, // A ticker symbol or shorthand, up to 5 chars.
            decimals, // The number of decimals in the token
            image, // A string url of the token logo
          },
        },
      })
      .then((success) => {
        if (!success) throw new Error('Rejected')
        return true
      })
  }

  /**
   * Switches the chain of the MetaMask wallet.
   *
   * Only switches the chain if the desired chain is different from the current chain.
   * Else returns the current chain id.
   */
  private async switchChain(desiredChainId?: number, desiredChain?: AddEthereumChainParameter): Promise<number> {
    if (!this.provider) throw new NoMetaMaskSDKError()

    const currentChainIdHex = (await this.provider.request({ method: 'eth_chainId' })) as string
    const currentChainId = parseChainId(currentChainIdHex)

    if (!desiredChainId || currentChainId === desiredChainId) return currentChainId

    const chainIdHex = `0x${desiredChainId.toString(16)}`
    this.provider
      .request<void>({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      })
      .catch(async (error: ProviderRpcError) => {
        // TODO: Replace any with proper type definitions
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const originalError = ((error.data as any)?.originalError ?? error) as ProviderRpcError

        if (originalError.code === 4902 && desiredChain !== undefined) {
          if (!this.provider) throw new NoMetaMaskSDKError()
          // if we're here, we can try to add a new network
          return this.provider.request<void>({
            method: 'wallet_addEthereumChain',
            params: [{ ...desiredChain, chainId: chainIdHex }],
          })
        }

        throw error
      })

    const newChainIdHex = (await this.provider.request({ method: 'eth_chainId' })) as string
    const newChainId = parseChainId(newChainIdHex)

    return newChainId
  }

  /**
   * Clears the cache.
   */
  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private clearCache() {
    localStorage.removeItem('.MMSDK_cached_address')
    localStorage.removeItem('.MMSDK_cached_chainId')
    localStorage.removeItem('.sdk-comm')
    localStorage.removeItem('.MetaMaskSDKLng')
  }
}
