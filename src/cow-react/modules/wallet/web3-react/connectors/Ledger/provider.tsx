import { TypedDataUtils, SignTypedDataVersion } from '@metamask/eth-sig-util'
import { TypedDataDomain, TypedDataField } from '@ethersproject/abstract-signer'
import type Transport from '@ledgerhq/hw-transport'
import ProviderEngine from 'web3-provider-engine'
import { LedgerOptions } from './connector'
import { GP_SETTLEMENT_CONTRACT_ADDRESS } from 'constants/index'
import { getContract } from 'utils'
import GPv2_SETTLEMENT_ABI from '@cow/abis/GPv2Settlement.json'
import { JsonRpcProvider } from '@ethersproject/providers'
import { RPC_URLS } from 'constants/networks'
import { RPCSubprovider } from '@0x/subproviders/lib/src/subproviders/rpc_subprovider'

interface LedgerModules {
  transportFactory: {
    create(): Promise<Transport>
  }
  createLedgerSubprovider: (factory: () => Promise<Transport>, options: unknown) => any
  LedgerEth: new (transport: Transport) => any
}

export interface EcdsaSignature {
  r: string
  s: string
  v: number
}

// TODO: use current chain Id
const DEFAULT_CHAIN_ID = 1
const derivationPaths = ["44'/60'/x'/0/0", "44'/60'/0'/x"]
const DEFAULT_RPC = RPC_URLS[DEFAULT_CHAIN_ID]

function _generateDerivationPaths(context: { accountsOffset: number; accountsLength: number }): string[] {
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

function _getModule(): Promise<LedgerModules> {
  return (
    Promise.all([
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

export class LedgerProvider {
  private readonly options: LedgerOptions
  private readonly rpcUrl: string
  private readonly chainId: number

  constructor(options: LedgerOptions) {
    this.options = options

    this.rpcUrl = this.options.rpc?.[this.options.chainId || 1] || DEFAULT_RPC
    this.chainId = this.options.chainId || DEFAULT_CHAIN_ID
  }

  async getDomainSeparator() {
    const provider = new JsonRpcProvider(this.rpcUrl)
    const address = GP_SETTLEMENT_CONTRACT_ADDRESS[this.chainId] || ''
    const contract = getContract(address, GPv2_SETTLEMENT_ABI, provider)

    return contract.domainSeparator()
  }

  signTypedData = async (
    _domain: TypedDataDomain,
    types: Record<string, Array<TypedDataField>>,
    value: Record<string, any>,
    primaryType: string
  ): Promise<string> => {
    const module = await _getModule()
    const transport = await module.transportFactory.create()

    const dataHash = TypedDataUtils.hashStruct(primaryType, value, types, SignTypedDataVersion.V4).toString('hex')

    try {
      const ledgerEth = new module.LedgerEth(transport)

      const pathList = _generateDerivationPaths({ accountsLength: 1, accountsOffset: 0 })

      const domainSeparator = await this.getDomainSeparator()

      const signature: EcdsaSignature = await ledgerEth.signEIP712HashedMessage(pathList[0], domainSeparator, dataHash)

      return '0x' + signature.r + signature.s + signature.v.toString(16)
    } finally {
      transport.close().catch((error: Error) => {
        console.error(error)
      })
    }
  }

  generateDerivationPaths = (context: { accountsOffset: number; accountsLength: number }): string[] => {
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

  activate = async () => {
    const { transportFactory, createLedgerSubprovider } = await _getModule()

    const engine = new ProviderEngine()

    const signTypedData = this.signTypedData

    const ledger = createLedgerSubprovider(() => transportFactory.create(), {
      networkId: this.chainId,
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

    const rpcSubProvider = new RPCSubprovider(this.rpcUrl)

    engine.addProvider(ledger)
    engine.addProvider(rpcSubProvider)
    engine.start()

    return engine
  }
}
