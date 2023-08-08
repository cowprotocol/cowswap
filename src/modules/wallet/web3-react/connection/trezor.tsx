import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { JsonRpcProvider } from '@ethersproject/providers'
import { serialize } from '@ethersproject/transactions'
import { initializeConnector } from '@web3-react/core'
import { Actions, Connector } from '@web3-react/types'

import { joinSignature } from 'ethers/lib/utils'

import { RPC_URLS } from 'legacy/constants/networks'
import { useIsActiveWallet } from 'legacy/hooks/useIsActiveWallet'

import { getCurrentChainIdFromUrl } from 'utils/getCurrentChainIdFromUrl'

import { default as TrezorImage } from '../../api/assets/trezor.svg'
import { ConnectWalletOption } from '../../api/pure/ConnectWalletOption'
import { ConnectionType } from '../../api/types'

import type { EthereumTransaction } from '@trezor/connect'

import { getConnectionName } from '../../api/utils/connection'

import type { TrezorConnect } from '@trezor/connect-web'

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

class TrezorProvider extends JsonRpcProvider {
  constructor(url: string, private account: string, private trezorConnect: TrezorConnect) {
    super(url)
  }

  async send(method: string, params: Array<any>): Promise<any> {
    if (method === 'eth_sendTransaction') {
      const { chainId } = await this.getNetwork()
      const nonce = await this.send('eth_getTransactionCount', [this.account, 'latest'])

      const originalTx = params[0]
      const estimation = await this.estimateGas(originalTx)

      const transaction: EthereumTransaction = {
        to: originalTx.to,
        value: originalTx.value || '0x0',
        gasPrice: originalTx.gasPrice || originalTx.gas,
        gasLimit: estimation.toHexString(),
        data: originalTx.data || '0x',
        nonce: nonce,
        chainId,
      }

      return this.trezorConnect
        .ethereumSignTransaction({
          path: defaultAccountPath,
          transaction,
        })
        .then((result) => {
          if (!result.success) throw new Error(result.payload.error)

          const tx = joinSignature({
            ...result.payload,
            v: +result.payload.v,
          })

          const serialized = serialize(
            { ...transaction, nonce: +transaction.nonce },
            {
              ...result.payload,
              v: +result.payload.v,
            }
          )

          // TODO: process errors
          return super.send('eth_sendRawTransaction', [serialized])
        })
    }

    return super.send(method, params)
  }
}

let isActivated = false

class TrezorConnector extends Connector {
  public customProvider?: TrezorProvider

  constructor(actions: Actions) {
    super(actions)
  }

  connectEagerly(...args: unknown[]) {
    return this.activate(args[0] as SupportedChainId)
  }

  async activate(desiredChainId: SupportedChainId = defaultChainId): Promise<void> {
    if (isActivated) return

    isActivated = true

    const { default: trezorConnect } = await import('@trezor/connect-web')
    const cancelActivation = this.actions.startActivation()
    const url = RPC_URLS[desiredChainId]

    try {
      await trezorConnect.init(trezorConfig)

      const accountResult = await trezorConnect.ethereumGetAddress({
        path: defaultAccountPath,
        showOnTrezor: false,
      })

      if (!accountResult.success) {
        return Promise.reject(new Error(accountResult.payload.error))
      }

      const account = accountResult.payload.address

      const customProvider = new TrezorProvider(url, account, trezorConnect)
      this.customProvider = customProvider

      const network = await customProvider.getNetwork()
      const { chainId } = network

      this.actions.update({ accounts: [account], chainId })

      console.log('ACTIVE', accountResult, network)
    } catch (error) {
      alert(error.message)

      isActivated = false
      cancelActivation()

      throw error
    }
  }
}

// Promise.all([import('@trezor/connect-web'), import('@trezor/connect-plugin-ethereum')]).then(
//   ([{ default: TrezorConnect }, { default: transformTypedDataPlugin }]) => {
//     // TODO
//     console.log('GGGGG', transformTypedDataPlugin)
//
//     return new TrezorConnector(actions, { TrezorConnect })
//   }
// ),

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
