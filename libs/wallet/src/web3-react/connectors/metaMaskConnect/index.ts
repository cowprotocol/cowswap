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

type MetaMaskConnectEvmClient = {
  init?: () => Promise<void>
  connect: (options?: { chainIds?: string[]; account?: string; forceRequest?: boolean }) => Promise<{
    accounts: string[]
    chainId: string
  }>
  disconnect: () => Promise<void>
  switchChain: (options: {
    chainId: string
    chainConfiguration?: {
      chainName: string
      nativeCurrency: { name: string; symbol: string; decimals: number }
      rpcUrls: string[]
      blockExplorerUrls?: string[]
    }
  }) => Promise<void>
  getProvider: () => Provider
}

type CreateEVMClient = (options: {
  dapp: { name?: string; url: string; iconUrl?: string }
  api?: { supportedNetworks?: Record<string, string> }
}) => Promise<MetaMaskConnectEvmClient>

type Listener = Parameters<Provider['on']>[1]

type MetaMaskProvider = Provider & {
  isConnected?: () => boolean
}

type MetaMaskConnectOptions = {
  dappMetadata: {
    name?: string
    url?: string
    iconUrl?: string
  }
  readonlyRPCMap?: Record<string, string>
}

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
        const createEVMClient = module.createEVMClient as CreateEVMClient
        this.client = await createEVMClient({
          dapp: {
            name: this.options.dappMetadata.name,
            url: this.options.dappMetadata.url ?? '',
            iconUrl: this.options.dappMetadata.iconUrl,
          },
          api: {
            supportedNetworks: this.options.readonlyRPCMap,
          },
        })

        await this.client.init?.()
      }

      this.provider = this.client.getProvider() as MetaMaskProvider

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
          chainIds: desiredChainId ? [`0x${desiredChainId.toString(16)}`] : undefined,
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

    const chainIdHex = `0x${desiredChainId.toString(16)}`

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
