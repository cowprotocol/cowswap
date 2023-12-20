import { ExternalProvider, Web3Provider } from '@ethersproject/providers'
import { Actions, Connector, Provider, RequestArguments } from '@web3-react/types'

import { LedgerConnectKit, SupportedProviders } from '@ledgerhq/connect-kit-loader'
import { WC_PROJECT_ID } from '../../constants'

type LedgerProvider = Provider & {
  connected: () => boolean
  request<T>(args: RequestArguments): Promise<T>
  disconnect: () => void
}

interface LedgerConstructorArgs {
  actions: Actions
  onError?: () => void
  options?: LedgerOptions
  kit: LedgerConnectKit
}

interface LedgerOptions {
  chainId?: number
  bridge?: string
  infuraId?: string
  rpc?: { [chainId: number]: string }
}

function parseChainId(chainId: number | string) {
  return Number.parseInt(String(chainId), 16)
}

export class Ledger extends Connector {
  public provider?: LedgerProvider
  private readonly options: LedgerOptions
  private eagerConnection?: Promise<void>
  private kit: LedgerConnectKit

  constructor({ actions, onError, kit, options = {} }: LedgerConstructorArgs) {
    super(actions, onError)

    this.options = options
    this.kit = kit
  }

  async getAccounts() {
    const provider = await this.getProvider()
    return (await provider.request({
      method: 'eth_requestAccounts',
    })) as string[]
  }

  async getChainId() {
    const provider = await this.getProvider()
    const chainId = (await provider.request({
      method: 'eth_chainId',
    })) as string

    return parseChainId(chainId)
  }

  async getProvider(
    { forceCreate }: { chainId?: number; forceCreate?: boolean } = {
      forceCreate: false,
    }
  ) {
    if (!this.provider || forceCreate) {
      const ledgerProvider = await this.kit.getProvider()
      this.provider = ledgerProvider as unknown as LedgerProvider
    }

    return this.provider
  }

  async getSigner() {
    const [provider, account] = await Promise.all([this.getProvider(), this.getAccounts()])
    return new Web3Provider(provider as ExternalProvider).getSigner(account[0])
  }

  async activateLedgerKit() {
    const connectKit = this.kit

    connectKit.enableDebugLogs()

    connectKit.checkSupport({
      providerType: SupportedProviders.Ethereum,
      walletConnectVersion: 2,
      projectId: WC_PROJECT_ID,
      chainId: this.options.chainId,
      infuraId: this.options.infuraId,
      rpcMap: this.options.rpc,
    })
  }

  async activateProvider() {
    if (!this.provider) return

    if (this.provider.on) {
      this.provider.on('accountsChanged', this.onAccountsChanged)
      this.provider.on('chainChanged', this.onChainChanged)
      this.provider.on('disconnect', this.onDisconnect)
      this.provider.on('close', this.onDisconnect)
    }

    const accounts = await this.getAccounts()
    const chainId = await this.getChainId()

    return this.actions.update({ chainId, accounts })
  }

  public async activate() {
    await this.activateLedgerKit()
    await this.getProvider({ forceCreate: true })
    await this.activateProvider()
  }

  public async connectEagerly(): Promise<void> {
    const cancelActivation = this.actions.startActivation()

    try {
      await this.activateLedgerKit()
      await this.getProvider({ forceCreate: true })

      if (!this.provider?.connected) return cancelActivation()

      this.activateProvider()
    } catch (error) {
      cancelActivation()
      throw error
    }
  }

  protected onAccountsChanged = (accounts: string[]): void => {
    if (accounts.length === 0) {
      this.actions.resetState()
    } else {
      this.actions.update({ accounts })
    }
  }

  protected onChainChanged = (chainId: number | string): void => {
    this.actions.update({ chainId: parseChainId(chainId) })
  }

  protected onDisconnect = (error: any): void => {
    this.actions.resetState()
    this.onError?.(error)
  }

  public async deactivate(): Promise<void> {
    await this.provider?.disconnect()
    this.provider = undefined
    this.eagerConnection = undefined
    this.actions.resetState()
  }
}
