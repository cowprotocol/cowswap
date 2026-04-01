/**
 * Web3-react bridge for MetaMask’s official **Connect EVM** stack (`@metamask/connect-evm`).
 *
 * We lazy-load the package, call `createEVMClient`, then forward the EIP-1193 provider into web3-react
 * so the rest of the app keeps using the same `activate` / hooks flow as other wallets.
 *
 * See `metaMaskConnect/README.md` in this folder for the human story (SDK → Connect, mobile, etc.).
 */
import type {
  Actions,
  AddEthereumChainParameter,
  Provider,
  ProviderConnectInfo,
  ProviderRpcError,
  WatchAssetParameters,
} from '@web3-react/types'
import { Connector } from '@web3-react/types'

import { parseChainId } from '../../utils/parseChainId'

import type * as ConnectEvm from '@metamask/connect-evm'

/** Whatever `createEVMClient` actually returns — we derive it from the package so types stay in sync. */
type MetaMaskConnectEvmClient = Awaited<ReturnType<typeof ConnectEvm.createEVMClient>>

type Listener = Parameters<Provider['on']>[1]

type MetaMaskProvider = Provider & {
  isConnected?: () => boolean
}

/** What we pass into the connector from `metaMaskConnect.tsx` (dapp branding + RPC map for read-only calls). */
type MetaMaskConnectOptions = {
  dappMetadata: {
    name?: string
    url?: string
    iconUrl?: string
  }
  readonlyRPCMap?: Record<string, string>
}

/** Thrown when the user picks MetaMask Connect but the client/provider never became available. */
export class NoMetaMaskConnectError extends Error {
  public constructor() {
    super('MetaMask Connect not installed')
    this.name = NoMetaMaskConnectError.name
    Object.setPrototypeOf(this, NoMetaMaskConnectError.prototype)
  }
}

export interface MetaMaskConnectConstructorArgs {
  actions: Actions
  options?: MetaMaskConnectOptions
  onError?: (error: Error) => void
}

function getOriginalRpcError(error: ProviderRpcError): ProviderRpcError {
  const data = error.data

  if (typeof data === 'object' && data !== null && 'originalError' in data) {
    const nestedError = (data as { originalError?: ProviderRpcError }).originalError
    if (nestedError) return nestedError
  }

  return error
}

/**
 * MetaMask wallet connection for CoW, backed by `@metamask/connect-evm` instead of the old `@metamask/sdk`.
 *
 * Responsibilities: spin up the EVM client once, subscribe provider events into web3-react state, and
 * implement `activate` / `deactivate` / chain switch the same way other connectors do.
 */
export class MetaMaskConnect extends Connector {
  private client?: MetaMaskConnectEvmClient
  provider?: MetaMaskProvider = undefined
  private readonly options: MetaMaskConnectOptions
  private eagerConnection?: Promise<void>

  constructor({ actions, options, onError }: MetaMaskConnectConstructorArgs) {
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

  private async isConnected(): Promise<boolean> {
    try {
      if (this.provider?.isConnected?.() === true) {
        const accounts = ((await this.provider.request({ method: 'eth_accounts' })) ?? []) as string[]
        return accounts.length > 0
      }
    } catch {
      // ignore provider errors while checking connectivity
    }

    return false
  }

  private async isomorphicInitialize(): Promise<void> {
    if (this.eagerConnection) return

    this.eagerConnection = import('@metamask/connect-evm').then(async (module) => {
      if (!this.client) {
        // Library entry point: builds the multichain client, wires mobile deeplinks when not in the extension.
        this.client = await module.createEVMClient({
          dapp: {
            name: this.options.dappMetadata.name ?? 'CoW Swap',
            url: this.options.dappMetadata.url ?? '',
            ...(this.options.dappMetadata.iconUrl !== undefined ? { iconUrl: this.options.dappMetadata.iconUrl } : {}),
          },
          api: {
            supportedNetworks: (this.options.readonlyRPCMap ?? {}) as Record<`0x${string}`, string>,
          },
          // Prefer native `metamask://` deeplinks on mobile (see @metamask/connect-multichain `mobile.useDeeplink`).
          mobile: {
            useDeeplink: true,
          },
        })
      }

      this.provider = this.client.getProvider() as unknown as MetaMaskProvider

      this.provider.on('connect', (({ chainId }: ProviderConnectInfo): void => {
        this.actions.update({ chainId: parseChainId(chainId) })
      }) as Listener)

      this.provider.on('disconnect', (async (error: ProviderRpcError): Promise<void> => {
        const originalError = getOriginalRpcError(error)

        // MetaMask may emit transient disconnects; keep session if accounts still available.
        if (error && originalError.code === 1013 && this.provider) {
          const accounts = (await this.provider.request({ method: 'eth_accounts' })) as string[]
          if (accounts.length > 0) return
        }

        this.actions.resetState()
        this.onError?.(error)
      }) as Listener)

      this.provider.on('chainChanged', ((chainId: string): void => {
        this.actions.update({ chainId: parseChainId(chainId) })
      }) as Listener)

      this.provider.on('accountsChanged', ((accounts: string[]): void => {
        if (accounts.length === 0) {
          this.actions.resetState()
        } else {
          this.actions.update({ accounts })
        }
      }) as Listener)
    })

    return this.eagerConnection
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
    } catch {
      this.actions.resetState()
    }
  }

  public async activate(desiredChainIdOrChainParameters?: number | AddEthereumChainParameter): Promise<void> {
    const [desiredChainId, desiredChain] =
      typeof desiredChainIdOrChainParameters === 'number'
        ? [desiredChainIdOrChainParameters, undefined]
        : [desiredChainIdOrChainParameters?.chainId, desiredChainIdOrChainParameters]

    if (this.provider && (await this.isConnected())) {
      await this.switchChain(desiredChainId, desiredChain)
      return
    }

    const cancelActivation = this.actions.startActivation()
    return this.isomorphicInitialize()
      .then(async () => {
        if (!this.provider || !this.client) throw new NoMetaMaskConnectError()

        const connectResult = await this.client.connect({
          chainIds: desiredChainId ? [`0x${desiredChainId.toString(16)}` as `0x${string}`] : undefined,
        })

        this.actions.update({ chainId: parseChainId(connectResult.chainId), accounts: connectResult.accounts })
      })
      .catch((error) => {
        cancelActivation?.()
        throw error
      })
  }

  public deactivate(): void {
    this.client?.disconnect().catch(() => {
      // ignore disconnect errors during teardown
    })
  }

  public async watchAsset({ address, symbol, decimals, image }: WatchAssetParameters): Promise<true> {
    if (!this.provider) throw new NoMetaMaskConnectError()

    return this.provider
      .request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address,
            symbol,
            decimals,
            image,
          },
        },
      })
      .then((success: unknown) => {
        if (success !== true) throw new Error('Rejected')
        return true
      })
  }

  private async switchChain(desiredChainId?: number, desiredChain?: AddEthereumChainParameter): Promise<number> {
    if (!this.provider || !this.client) throw new NoMetaMaskConnectError()

    const currentChainIdHex = (await this.provider.request({ method: 'eth_chainId' })) as string
    const currentChainId = parseChainId(currentChainIdHex)

    if (!desiredChainId || currentChainId === desiredChainId) return currentChainId

    const chainIdHex = `0x${desiredChainId.toString(16)}` as `0x${string}`

    try {
      await this.client.switchChain({
        chainId: chainIdHex,
        chainConfiguration:
          desiredChain !== undefined
            ? {
                chainName: desiredChain.chainName,
                nativeCurrency: desiredChain.nativeCurrency,
                rpcUrls: desiredChain.rpcUrls,
                blockExplorerUrls: desiredChain.blockExplorerUrls,
              }
            : undefined,
      })
    } catch (error) {
      throw error
    }

    const newChainIdHex = (await this.provider.request({ method: 'eth_chainId' })) as string
    return parseChainId(newChainIdHex)
  }
}
