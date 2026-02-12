import CowImage from '@cowprotocol/assets/cow-swap/cow_token.svg'
import { ALL_SUPPORTED_CHAIN_IDS } from '@cowprotocol/cow-sdk'
import type {
  Actions,
  AddEthereumChainParameter,
  ProviderConnectInfo,
  ProviderRpcError,
  WatchAssetParameters,
} from '@web3-react/types'
import { Connector } from '@web3-react/types'

import type { CoinbaseWalletProvider } from '@coinbase/wallet-sdk'

const EVENT_DELAY_MS = 1000

/**
 * Patched version of
 * https://github.com/Uniswap/web3-react/blob/8507a82d0647e74eb2fbbadc00447d2a9be0e07a/packages/coinbase-wallet/src/index.ts
 *
 * Changes:
 *  - added 1s delay for provider events to avoid race conditions. The provider sends an event before resolving request promise
 *  - changed connected getter, the new SDK version doesn't have provider?.selectedAddress
 *  - added cancelActivation() calls in connectEagerly() and activate()
 *  - added cleanUpProvider() in deactivate and when initialization failed
 *  - changed eth_accounts to eth_requestAccounts because new version of the SDK requires this method to be called first of all
 */

function parseChainId(chainId: string | number): number {
  return typeof chainId === 'number' ? chainId : Number.parseInt(chainId, chainId.startsWith('0x') ? 16 : 10)
}

/**
 * @param options - Options to pass to `@coinbase/wallet-sdk`.
 * @param onError - Handler to report errors thrown from eventListeners.
 */
export interface CoinbaseWalletConstructorArgs {
  actions: Actions
  onError?: (error: Error) => void
}

export class CoinbaseWallet extends Connector {
  private eagerConnection?: Promise<void>

  private currentChainId: string | null = null

  private currentAccountAddress: string | null = null

  private get connected(): boolean {
    return !!this.currentAccountAddress
  }

  constructor({ actions, onError }: CoinbaseWalletConstructorArgs) {
    super(actions, onError)
  }

  /**
   * The CoinbaseWalletProvider is buggy
   * It fires events before resolving .request() promise
   * Because of that, we need a delay here and in onAccountsChanged
   */
  private onConnect = ({ chainId }: ProviderConnectInfo): void => {
    setTimeout(() => {
      this.actions.update({ chainId: parseChainId(chainId) })
    }, EVENT_DELAY_MS)
  }

  private onDisconnect = (error: ProviderRpcError): void => {
    this.actions.resetState()
    this.onError?.(error)
  }

  private onChainChanged = (chainId: string): void => {
    this.actions.update({ chainId: parseChainId(chainId) })
  }

  private onAccountsChanged = (accounts: string[]): void => {
    setTimeout(() => {
      if (accounts.length === 0) {
        // handle this edge case by disconnecting
        this.actions.resetState()
      } else {
        this.actions.update({ accounts })
      }
    }, EVENT_DELAY_MS)
  }

  private async isomorphicInitialize(): Promise<void> {
    if (this.eagerConnection) return

    await (this.eagerConnection = import('@coinbase/wallet-sdk').then((m) => {
      const sdk = m.createCoinbaseWalletSDK({
        appName: 'CoW Swap',
        appChainIds: ALL_SUPPORTED_CHAIN_IDS,
        appLogoUrl: CowImage,
      })

      this.provider = sdk.getProvider()

      this.provider.on('connect', this.onConnect)
      this.provider.on('disconnect', this.onDisconnect)
      this.provider.on('chainChanged', this.onChainChanged)
      this.provider.on('accountsChanged', this.onAccountsChanged)
    }))
  }

  /** {@inheritdoc Connector.connectEagerly} */
  public async connectEagerly(): Promise<void> {
    const cancelActivation = this.actions.startActivation()

    try {
      await this.isomorphicInitialize()

      const provider = this.provider as CoinbaseWalletProvider

      // There is no way to detect if a session is still alive, the only way is to check the private `signer`
      // @ts-ignore
      if (!provider?.signer) {
        this.cleanUpProvider()
        return cancelActivation()
      }

      // Wallets may resolve eth_chainId and hang on eth_requestAccounts pending user interaction, which may include changing
      // chains; they should be requested serially, with accounts first, so that the chainId can settle.
      const accounts = (await provider.request({ method: 'eth_requestAccounts' })) as string[]
      if (!accounts.length) throw new Error('No accounts returned')
      const chainId = (await provider.request({ method: 'eth_chainId' })) as string
      this.currentAccountAddress = accounts[0]
      this.currentChainId = chainId
      this.actions.update({ chainId: parseChainId(chainId), accounts })
    } catch (error) {
      cancelActivation()
      throw error
    }
  }

  /**
   * Initiates a connection.
   *
   * @param desiredChainIdOrChainParameters - If defined, indicates the desired chain to connect to. If the user is
   * already connected to this chain, no additional steps will be taken. Otherwise, the user will be prompted to switch
   * to the chain, if one of two conditions is met: either they already have it added, or the argument is of type
   * AddEthereumChainParameter, in which case the user will be prompted to add the chain with the specified parameters
   * first, before being prompted to switch.
   */
  // eslint-disable-next-line complexity
  public async activate(desiredChainIdOrChainParameters?: number | AddEthereumChainParameter): Promise<void> {
    const desiredChainId =
      typeof desiredChainIdOrChainParameters === 'number'
        ? desiredChainIdOrChainParameters
        : desiredChainIdOrChainParameters?.chainId

    if (this.provider && this.connected) {
      if (!desiredChainId || (this.currentChainId && desiredChainId === parseChainId(this.currentChainId))) return

      const desiredChainIdHex = `0x${desiredChainId.toString(16)}`
      return (await this.provider
        .request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: desiredChainIdHex }],
        })
        .catch(async (error: ProviderRpcError) => {
          if (error.code === 4902 && typeof desiredChainIdOrChainParameters !== 'number') {
            if (!this.provider) throw new Error('No provider')
            // if we're here, we can try to add a new network
            return this.provider.request({
              method: 'wallet_addEthereumChain',
              params: [{ ...desiredChainIdOrChainParameters, chainId: desiredChainIdHex }],
            })
          }

          throw error
        })) as void
    }

    const cancelActivation = this.actions.startActivation()

    try {
      await this.isomorphicInitialize()
      if (!this.provider) throw new Error('No provider')

      const provider = this.provider as CoinbaseWalletProvider
      // Wallets may resolve eth_chainId and hang on eth_accounts pending user interaction, which may include changing
      // chains; they should be requested serially, with accounts first, so that the chainId can settle.
      const accounts = (await provider.request({ method: 'eth_requestAccounts' })) as string[]
      const chainId = (await provider.request({ method: 'eth_chainId' })) as string
      const receivedChainId = parseChainId(chainId)
      this.currentAccountAddress = accounts[0]
      this.currentChainId = chainId

      if (!desiredChainId || desiredChainId === receivedChainId)
        return this.actions.update({ chainId: receivedChainId, accounts })

      // if we're here, we can try to switch networks
      const desiredChainIdHex = `0x${desiredChainId.toString(16)}`
      return (await provider
        ?.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: desiredChainIdHex }],
        })
        .catch(async (error: ProviderRpcError) => {
          if (error.code === 4902 && typeof desiredChainIdOrChainParameters !== 'number') {
            if (!this.provider) throw new Error('No provider')
            // if we're here, we can try to add a new network
            return this.provider.request({
              method: 'wallet_addEthereumChain',
              params: [{ ...desiredChainIdOrChainParameters, chainId: desiredChainIdHex }],
            })
          }

          throw error
        })) as void
    } catch (error) {
      cancelActivation()
      throw error
    }
  }

  /** {@inheritdoc Connector.deactivate} */
  public async deactivate(): Promise<void> {
    this.currentChainId = null
    this.currentAccountAddress = null
    this.actions.resetState()
    this.cleanUpProvider()
    await (this.provider as CoinbaseWalletProvider)?.disconnect()
  }

  public cleanUpProvider(): void {
    this.eagerConnection = undefined

    if (this.provider) {
      const provider = this.provider as CoinbaseWalletProvider
      provider.removeListener('connect', this.onConnect)
      provider.removeListener('disconnect', this.onDisconnect)
      provider.removeListener('chainChanged', this.onChainChanged)
      provider.removeListener('accountsChanged', this.onAccountsChanged)
    }
  }

  public async watchAsset({
    address,
    symbol,
    decimals,
    image,
  }: Pick<WatchAssetParameters, 'address'> & Partial<Omit<WatchAssetParameters, 'address'>>): Promise<true> {
    if (!this.provider) throw new Error('No provider')

    return this.provider
      .request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
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
}
