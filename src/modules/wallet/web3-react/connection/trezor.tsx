import { SupportedChainId } from '@cowprotocol/cow-sdk'
import type { TypedDataDomain, TypedDataField } from '@ethersproject/abstract-signer'
import { JsonRpcProvider } from '@ethersproject/providers'
import { serialize } from '@ethersproject/transactions'
import { initializeConnector } from '@web3-react/core'
import { Actions, Connector } from '@web3-react/types'

import { jotaiStore } from 'jotaiStore'

import { RPC_URLS } from 'legacy/constants/networks'
import { useIsActiveWallet } from 'legacy/hooks/useIsActiveWallet'

import { gasPriceAtom } from 'modules/gasPirce'

import { getCurrentChainIdFromUrl } from 'utils/getCurrentChainIdFromUrl'

import { default as TrezorImage } from '../../api/assets/trezor.svg'
import { ConnectWalletOption } from '../../api/pure/ConnectWalletOption'

import type { EthereumTransaction } from '@trezor/connect'
import type transformTypedData from '@trezor/connect-plugin-ethereum'

import { ConnectionType } from '../../api/types'

import type { TrezorConnect } from '@trezor/connect-web'

import { getConnectionName } from '../../api/utils/connection'
import { Web3ReactConnection } from '../types'

const BASE_PROPS = {
  color: '#4196FC',
  icon: TrezorImage,
  id: 'trezor',
}

const defaultChainId = getCurrentChainIdFromUrl()

// TODO: add support for multiple accounts
const defaultAccountPath = "m/44'/60'/0'/0/0"

const trezorConfig: Parameters<TrezorConnect['init']>[0] = {
  env: 'web',
  manifest: {
    email: 'dev@cow.fi',
    appUrl: 'https://cow.fi',
  },
}

const DEFAULT_GOERLI_GAS_PRICE = `0x${(40 * 10 ** 9).toString(16)}` // 40 GWEI

async function getTrezorAccount(trezorConnect: TrezorConnect): Promise<string> {
  const accountResult = await trezorConnect.ethereumGetAddress({
    path: defaultAccountPath,
    showOnTrezor: false,
  })

  if (!accountResult.success) {
    throw new Error(accountResult.payload.error)
  }

  return accountResult.payload.address
}

async function _signTypedData(
  domain: TypedDataDomain,
  types: Record<string, Array<TypedDataField>>,
  message: Record<string, any>,
  primaryType: string,
  trezorConnect: TrezorConnect,
  _transformTypedData: typeof transformTypedData
): Promise<string> {
  const eip712Data = {
    domain,
    types,
    message,
    primaryType,
  } as Parameters<typeof _transformTypedData>[0]

  const { domain_separator_hash, message_hash } = _transformTypedData(eip712Data, true)

  if (!message_hash) throw new Error('Trezor sign typed data no message hash: ' + JSON.stringify(eip712Data))

  const result = await trezorConnect.ethereumSignTypedData({
    path: defaultAccountPath,
    data: eip712Data,
    metamask_v4_compat: true,
    // These are optional, but required for T1 compatibility
    domain_separator_hash,
    message_hash,
  })

  if (!result.success) throw new Error(result.payload.error)

  const { signature } = result.payload

  return signature
}

class TrezorProvider extends JsonRpcProvider {
  constructor(
    url: string,
    private account: string,
    private trezorConnect: TrezorConnect,
    private _transformTypedData: typeof transformTypedData
  ) {
    super(url)
  }

  async send(method: string, params: Array<any>): Promise<any> {
    if (method === 'eth_accounts') {
      return [this.account]
    }
    if (method.startsWith('eth_signTypedData')) {
      const { domain, types, message, primaryType } = JSON.parse(params[1])

      return _signTypedData(domain, types, message, primaryType, this.trezorConnect, this._transformTypedData)
    }

    if (method === 'eth_sendTransaction') {
      const { chainId } = await this.getNetwork()
      const nonce = await this.send('eth_getTransactionCount', [this.account, 'latest'])

      const originalTx = params[0]
      const estimation = await this.estimateGas(originalTx)
      const gasPrice =
        chainId === SupportedChainId.GOERLI ? DEFAULT_GOERLI_GAS_PRICE : jotaiStore.get(gasPriceAtom)?.fast

      const transaction: EthereumTransaction = {
        to: originalTx.to,
        value: originalTx.value || '0x0',
        data: originalTx.data || '0x',
        gasPrice: gasPrice || '0x0',
        gasLimit: estimation.toHexString(),
        nonce,
        chainId,
      }

      const { success, payload } = await this.trezorConnect.ethereumSignTransaction({
        path: defaultAccountPath,
        transaction,
      })

      if (!success) {
        console.error('Trezor tx signing error: ', payload)
        throw new Error(payload.error)
      }

      const serialized = serialize(
        { ...transaction, nonce: +transaction.nonce },
        {
          ...payload,
          v: +payload.v,
        }
      )

      return super.send('eth_sendRawTransaction', [serialized])
    }

    return super.send(method, params)
  }
}

let activatedNetwork: SupportedChainId | null = null

class TrezorConnector extends Connector {
  public customProvider?: TrezorProvider

  constructor(actions: Actions) {
    super(actions)
  }

  connectEagerly(...args: unknown[]) {
    return this.activate(args[0] as SupportedChainId)
  }

  async activate(chainId?: SupportedChainId | { chainId: SupportedChainId }): Promise<void> {
    const desiredChainId = typeof chainId === 'object' ? chainId.chainId : chainId || defaultChainId

    if (activatedNetwork === desiredChainId) return

    const { default: trezorConnect } = await import('@trezor/connect-web')
    const { default: transformTypedData } = await import('@trezor/connect-plugin-ethereum')
    const url = RPC_URLS[desiredChainId]
    let cancelActivation: () => void = () => void 0

    const handleError = (error: Error) => {
      alert(error.message)

      activatedNetwork = null
      cancelActivation()

      throw error
    }

    const installProvider = async () => {
      const account = await getTrezorAccount(trezorConnect)

      const customProvider = new TrezorProvider(url, account, trezorConnect, transformTypedData)

      this.customProvider = customProvider

      const network = await customProvider.getNetwork()
      const { chainId } = network

      this.actions.update({ accounts: [account], chainId })
    }

    if (activatedNetwork !== null) {
      try {
        return installProvider()
      } catch (error) {
        handleError(error)
      }
    }

    activatedNetwork = desiredChainId

    cancelActivation = this.actions.startActivation()

    try {
      await trezorConnect.init(trezorConfig)

      await installProvider()
    } catch (error) {
      handleError(error)
    }
  }
}

const [trezor, trezorHooks] = initializeConnector<TrezorConnector>((actions) => new TrezorConnector(actions))

export const trezorConnection: Web3ReactConnection = {
  connector: trezor,
  hooks: trezorHooks,
  type: ConnectionType.TREZOR,
}

export function TrezorOption({ tryActivation }: { tryActivation: (connector: Connector) => void }) {
  const isActive = useIsActiveWallet(trezorConnection)

  return (
    <ConnectWalletOption
      {...BASE_PROPS}
      isActive={isActive}
      onClick={() => tryActivation(trezorConnection.connector)}
      header={getConnectionName(ConnectionType.TREZOR)}
    />
  )
}
