import { Actions, Connector, Provider } from '@web3-react/types'
import { Web3Provider, ExternalProvider } from '@ethersproject/providers'
import type Transport from '@ledgerhq/hw-transport'
import ProviderEngine from 'web3-provider-engine'

global.process = { browser: true } as any
const RpcSubprovider = require('web3-provider-engine/subproviders/rpc')

const derivationPaths = ["44'/60'/x'/0/0", "44'/60'/0'/x"]

export function generateDerivationPaths(context: { accountsOffset: number; accountsLength: number }): string[] {
  const { accountsOffset, accountsLength } = context
  const pathList: string[] = []

  for (let i = accountsOffset; i < accountsOffset + accountsLength; i++) {
    const x = Math.floor(i / derivationPaths.length)
    const pathIndex = i - derivationPaths.length * x
    const path = derivationPaths[pathIndex].replace('x', String(x))

    pathList.push(path)
  }

  return pathList
}

export interface EcdsaSignature {
  r: string
  s: string
  v: number
}

interface LedgerConstructorArgs {
  actions: Actions
  onError?: () => void
  options?: LedgerOptions
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

interface LedgerModules {
  transportFactory: {
    create(): Promise<Transport>
  }
  createLedgerSubprovider: (factory: () => Promise<Transport>, options: unknown) => any
  LedgerEth: new (transport: Transport) => any
}

export class Ledger extends Connector {
  static getModule(): Promise<LedgerModules> {
    return (
      Promise.all([
        // @ts-ignore
        import('@ledgerhq/hw-transport-u2f'),
        // @ts-ignore
        import('@ledgerhq/hw-transport-webhid'),
        // @ts-ignore
        import('@ledgerhq/web3-subprovider'),
        // @ts-ignore
        import('@ledgerhq/hw-app-eth'),
      ])
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .then(([TransportU2F, TransportWebHID, createLedgerSubprovider, LedgerEth]) => {
          return {
            transportFactory: 'hid' in navigator ? TransportWebHID.default : TransportU2F.default,
            createLedgerSubprovider: createLedgerSubprovider.default,
            LedgerEth: LedgerEth.default,
          }
        })
    )
  }

  public provider?: Provider
  private readonly options: LedgerOptions

  private isActivated = false

  private providerRequests: ((provider: Provider) => void)[] = []

  constructor({ actions, onError, options = {} }: LedgerConstructorArgs) {
    super(actions, onError)

    this.options = options
  }

  async getProvider(
    { forceCreate }: { chainId?: number; forceCreate?: boolean } = {
      forceCreate: false,
    }
  ): Promise<Provider> {
    if (!this.provider) {
      if (forceCreate) {
        this.activate()
      }

      return new Promise((resolve) => {
        this.providerRequests.push(resolve)
      })
    }

    return Promise.resolve(this.provider)
  }

  async getAccounts() {
    const provider = await this.getProvider()
    const accounts = (await provider.request({
      method: 'eth_accounts',
    })) as string[]

    return accounts
  }

  async getChainId() {
    console.log('getChainId')

    return 1
    // const provider = await this.getProvider()
    // const chainId = (await provider.request({
    //   method: 'eth_networkId',
    // })) as string
    //
    // return +chainId
  }

  async getSigner() {
    console.log('getSigner')

    const [provider, account] = await Promise.all([this.getProvider(), this.getAccounts()])
    const signer = new Web3Provider(provider as ExternalProvider).getSigner(account[0])

    // TODO: implement this
    // signer._signTypedData = async (domain: TypedDataDomain, types: Record<string, Array<TypedDataField>>, value: Record<string, any>) => {
    //   const module = await Ledger.getModule();
    //   const transport = await module.transportFactory.create();
    //
    //   try {
    //     const ledgerEth = new module.LedgerEth(transport);
    //
    //     const pathList = generateDerivationPaths({accountsLength: 1, accountsOffset: 0});
    //
    //     const signature: EcdsaSignature = await ledgerEth.signEIP712HashedMessage(
    //       pathList[0],
    //       domainSeparator,
    //       dataHash
    //     );
    //
    //     return '0x' + signature.r + signature.s + signature.v.toString(16);
    //   }
    //   finally {
    //     transport.close().catch((error) => {
    //       console.error(error);
    //     });
    //   }
    // }

    return signer
  }

  async activate() {
    if (this.isActivated) return

    this.isActivated = true

    const { transportFactory, createLedgerSubprovider } = await Ledger.getModule()

    const engine = new ProviderEngine()

    const ledger = createLedgerSubprovider(() => transportFactory.create(), {
      networkId: 1,
      accountsOffset: 0,
      accountsLength: 1,
    })

    ;(engine as any)['request'] = function (request: any) {
      return new Promise((resolve, reject) => {
        engine.sendAsync(request, (error, result) => {
          const resultError = error

          if (resultError) {
            console.log('ERROR REQUEST: ', request)
            reject(resultError)
          } else {
            resolve(result.result)
          }
        })
      })
    }

    engine.addProvider(ledger)
    engine.addProvider(new RpcSubprovider({ rpcUrl: this.options.rpc?.[1] }))
    engine.start()

    this.provider = engine as any
    this.providerRequests.forEach((callback) => {
      callback(engine as any)
    })
    this.providerRequests = []

    const accounts = await this.getAccounts()
    const chainId = await this.getChainId()

    return this.actions.update({ chainId, accounts })
  }

  async connectEagerly(): Promise<void> {
    return undefined
  }

  deactivate(...args: unknown[]): Promise<void> | void {
    this.isActivated = false

    return super.deactivate?.(...args)
  }
}
