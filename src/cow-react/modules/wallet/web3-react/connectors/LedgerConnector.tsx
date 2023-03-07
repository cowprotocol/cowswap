import { Actions, Connector, Provider } from '@web3-react/types'
import type Transport from '@ledgerhq/hw-transport'
import ProviderEngine from 'web3-provider-engine'
import { TypedDataUtils, SignTypedDataVersion } from '@metamask/eth-sig-util'
import { TypedDataDomain, TypedDataField } from '@ethersproject/abstract-signer'

global.process = { browser: true } as any
const RpcSubprovider = require('web3-provider-engine/subproviders/rpc')

// TODO: use current chain Id
const currentChainId = 1
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

interface LedgerModules {
  transportFactory: {
    create(): Promise<Transport>
  }
  createLedgerSubprovider: (factory: () => Promise<Transport>, options: unknown) => any
  LedgerEth: new (transport: Transport) => any
}

const signTypedData = async (
  _domain: TypedDataDomain,
  types: Record<string, Array<TypedDataField>>,
  value: Record<string, any>,
  primaryType: string
): Promise<string> => {
  const module = await Ledger.getModule()
  const transport = await module.transportFactory.create()

  // TODO: https://etherscan.io/address/0x9008d19f58aabd9ed0d60971565aa8510560ab41#readContract
  const domainSeparator = '0xc078f884a2676e1345748b1feace7b0abee5d00ecadb6e574dcdd109a63e8943'
  const dataHash = TypedDataUtils.hashStruct(primaryType, value, types, SignTypedDataVersion.V4).toString('hex')

  try {
    const ledgerEth = new module.LedgerEth(transport)

    const pathList = generateDerivationPaths({ accountsLength: 1, accountsOffset: 0 })

    const signature: EcdsaSignature = await ledgerEth.signEIP712HashedMessage(pathList[0], domainSeparator, dataHash)

    return '0x' + signature.r + signature.s + signature.v.toString(16)
  } finally {
    transport.close().catch((error) => {
      console.error(error)
    })
  }
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

  async getAccounts(): Promise<string[]> {
    const provider = await this.getProvider()
    return (await provider.request({
      method: 'eth_accounts',
    })) as string[]
  }

  async getChainId(): Promise<number> {
    return currentChainId
    // TODO: fix me
    // const provider = await this.getProvider()
    // const chainId = (await provider.request({
    //   method: 'eth_networkId',
    // })) as string
    //
    // return +chainId
  }

  async activate() {
    if (this.isActivated) return

    this.isActivated = true

    const { transportFactory, createLedgerSubprovider } = await Ledger.getModule()

    const engine = new ProviderEngine()

    const ledger = createLedgerSubprovider(() => transportFactory.create(), {
      networkId: currentChainId,
      accountsOffset: 0,
      accountsLength: 1,
    })

    ;(engine as any)['request'] = function (request: any) {
      if (request.method === 'eth_signTypedData_v4') {
        const { domain, message, primaryType, types } = JSON.parse(request.params[1])
        return signTypedData(domain, types, message, primaryType)
      }

      return new Promise((resolve, reject) => {
        engine.sendAsync({ id: 1, jsonrpc: '2.0', ...request }, (error, result) => {
          const resultError = error

          if (resultError) {
            reject(resultError)
          } else {
            resolve(result.result)
          }
        })
      })
    }

    engine.addProvider(ledger)
    engine.addProvider(new RpcSubprovider({ rpcUrl: this.options.rpc?.[currentChainId] }))
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
    return this.activate()
  }

  deactivate(...args: unknown[]): Promise<void> | void {
    this.isActivated = false

    return super.deactivate?.(...args)
  }
}
