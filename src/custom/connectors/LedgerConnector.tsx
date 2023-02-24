import type { Actions } from '@web3-react/types'
import { Connector } from '@web3-react/types'
import { loadConnectKit, LedgerConnectKit, SupportedProviders, EthereumProvider } from '@ledgerhq/connect-kit-loader'
import { RequestArguments } from '@web3-react/types'
// import { Web3Provider } from '@ethersproject/providers'
import { EventEmitter } from 'events'

export interface LedgerConstructorArgs {
  actions: Actions
  onError?: () => void
  options?: any
}

interface EIP1193Provider extends EventEmitter {
  connect(params?: any): Promise<void>
  disconnect(): Promise<void>
  request(args: RequestArguments): Promise<unknown>
}

export class UserRejectedRequestError extends Error {
  public constructor() {
    super()
    this.name = this.constructor.name
    this.message = 'The user rejected the request.'
  }
}

export class LedgerAppProvider extends EventEmitter implements EIP1193Provider {
  public provider?: EthereumProvider

  public async connect(params?: any): Promise<void> {}

  public async disconnect(): Promise<void> {}

  public async request(args: RequestArguments): Promise<unknown> {
    return null
  }
}

type LedgerConnectorOptions = {
  chainId?: number
  bridge?: string
  infuraId?: string
  rpc?: { [chainId: number]: string }

  enableDebugLogs?: boolean
}

export class Ledger extends Connector {
  /** {@inheritdoc Connector.provider} */
  public provider?: LedgerAppProvider

  private connectKitPromise: Promise<LedgerConnectKit>
  private readonly options?: LedgerConnectorOptions

  constructor({ actions, onError, options }: LedgerConstructorArgs) {
    super(actions, onError)
    this.options = options

    this.connectKitPromise = loadConnectKit()
  }

  /** {@inheritdoc Connector.connectEagerly} */
  public async connectEagerly(): Promise<void> {}

  public async activate(): Promise<void> {
    try {
      const connectKit = await this.connectKitPromise

      connectKit.checkSupport({
        providerType: SupportedProviders.Ethereum,
        chainId: this.options?.chainId,
        infuraId: this.options?.infuraId,
        rpc: this.options?.rpc,
      })

      const provider = await this.getProvider({ forceCreate: true })

      console.log('provider', provider)
    } catch (err) {
      console.log('Error: ', err)
    }
  }

  async getProvider(
    { forceCreate }: { chainId?: number; forceCreate?: boolean } = {
      forceCreate: false,
    }
  ) {
    let provider

    if (!this.provider || forceCreate) {
      const connectKit = await this.connectKitPromise
      provider = (await connectKit.getProvider()) as EthereumProvider
    }

    return provider
  }
}
