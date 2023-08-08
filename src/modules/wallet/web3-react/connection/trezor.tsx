import { SupportedChainId } from '@cowprotocol/cow-sdk'
import type { TypedDataDomain, TypedDataField } from '@ethersproject/abstract-signer'
import { JsonRpcProvider } from '@ethersproject/providers'
import { initializeConnector } from '@web3-react/core'
import { Actions, Connector } from '@web3-react/types'

import { jotaiStore } from 'jotaiStore'

import { RPC_URLS } from 'legacy/constants/networks'
import { useIsActiveWallet } from 'legacy/hooks/useIsActiveWallet'

import { getCurrentChainIdFromUrl } from 'utils/getCurrentChainIdFromUrl'

import { default as TrezorImage } from '../../api/assets/trezor.svg'
import { ConnectWalletOption } from '../../api/pure/ConnectWalletOption'
import { hwAccountIndexAtom } from '../../api/state'

import type transformTypedData from '@trezor/connect-plugin-ethereum'

import { ConnectionType } from '../../api/types'

import type { TrezorConnect } from '@trezor/connect-web'

import { getConnectionName } from '../../api/utils/connection'
import { sendTransactionHandler } from '../connectors/TrezorConnector/sendTransactionHandler'
import { Web3ReactConnection } from '../types'

const BASE_PROPS = {
  color: '#4196FC',
  icon: TrezorImage,
  id: 'trezor',
}

const defaultChainId = getCurrentChainIdFromUrl()

const getCurrentAccountIndex = () => jotaiStore.get(hwAccountIndexAtom)

const getAccountPath = (): string => {
  const index = getCurrentAccountIndex()

  return `m/44'/60'/0'/0/${index}`
}

const trezorConfig: Parameters<TrezorConnect['init']>[0] = {
  env: 'web',
  manifest: {
    email: 'dev@cow.fi',
    appUrl: 'https://cow.fi',
  },
}

async function getTrezorAccount(trezorConnect: TrezorConnect): Promise<string> {
  const accountResult = await trezorConnect.ethereumGetAddress({
    path: getAccountPath(),
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
    path: getAccountPath(),
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
    public readonly account: string,
    public readonly trezorConnect: TrezorConnect,
    public readonly _transformTypedData: typeof transformTypedData
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
      return sendTransactionHandler(params, this.account, this, this.trezorConnect)
    }

    return super.send(method, params)
  }
}

let activatedNetwork: SupportedChainId | null = null

class TrezorConnector extends Connector {
  public customProvider?: TrezorProvider

  private currentAccountIndex = 0

  constructor(actions: Actions) {
    super(actions)
  }

  connectEagerly(...args: unknown[]) {
    return this.activate(args[0] as SupportedChainId)
  }

  async activate(
    chainId: SupportedChainId | { chainId: SupportedChainId } = defaultChainId,
    indexChanged = false
  ): Promise<void> {
    const desiredChainId = typeof chainId === 'object' ? chainId.chainId : chainId

    if (indexChanged) {
      if (this.currentAccountIndex === getCurrentAccountIndex()) return
    }

    if (activatedNetwork === desiredChainId && !indexChanged) return

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

      this.currentAccountIndex = getCurrentAccountIndex()
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

  deactivate(): Promise<void> | void {
    return this.customProvider?.trezorConnect.dispose()
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
