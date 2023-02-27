import { initializeConnector, Web3ReactHooks } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'
import { Network } from '@web3-react/network'
import { Actions, Connector } from '@web3-react/types'
import { SupportedChainId } from 'constants/chains'

import COWSWAP_LOGO_URL from 'assets/cow-swap/cow.svg'
import { RPC_URLS } from 'constants/networks'

export enum ConnectionType {
  INJECTED = 'INJECTED',
  COINBASE_WALLET = 'COINBASE_WALLET',
  WALLET_CONNECT = 'WALLET_CONNECT',
  FORTMATIC = 'FORTMATIC',
  NETWORK = 'NETWORK',
  GNOSIS_SAFE = 'GNOSIS_SAFE',
  ZENGO = 'ZENGO',
}

export interface Connection {
  connector: Connector
  hooks: Web3ReactHooks
  type: ConnectionType
}

/**
 * To avoid including external libs for wallet connection in the bundle
 * We load them in runtime by demand
 */
class AsyncConnector extends Connector {
  constructor(private loader: () => Promise<Connector>, actions: Actions, onError?: (error: Error) => void) {
    super(actions, onError)
  }

  activate(...args: unknown[]): Promise<void> | void {
    return this.loader().then((connector) => {
      // There is a magic - we change async-connector prototype to the loaded connector
      ;(this as any).__proto__ = connector
      return connector.activate(...args)
    })
  }
}

function onError(error: Error) {
  console.debug(`web3-react error: ${error}`)
}

const [web3Network, web3NetworkHooks] = initializeConnector<Network>(
  (actions) => new Network({ actions, urlMap: RPC_URLS, defaultChainId: 1 })
)
export const networkConnection: Connection = {
  connector: web3Network,
  hooks: web3NetworkHooks,
  type: ConnectionType.NETWORK,
}

const [web3Injected, web3InjectedHooks] = initializeConnector<MetaMask>((actions) => new MetaMask({ actions, onError }))
export const injectedConnection: Connection = {
  connector: web3Injected,
  hooks: web3InjectedHooks,
  type: ConnectionType.INJECTED,
}

const [web3GnosisSafe, web3GnosisSafeHooks] = initializeConnector<Connector>((actions) => {
  return new AsyncConnector(
    () => {
      return import('@web3-react/gnosis-safe').then((module) => {
        return new module.GnosisSafe({ actions })
      })
    },
    actions,
    onError
  )
})

export const gnosisSafeConnection: Connection = {
  connector: web3GnosisSafe,
  hooks: web3GnosisSafeHooks,
  type: ConnectionType.GNOSIS_SAFE,
}

const [web3WalletConnect, web3WalletConnectHooks] = initializeConnector<Connector>((actions) => {
  return new AsyncConnector(
    () => {
      return import('@web3-react/walletconnect').then((module) => {
        return new module.WalletConnect({
          actions,
          options: {
            rpc: RPC_URLS,
            qrcode: true,
          },
          onError,
        })
      })
    },
    actions,
    onError
  )
})
export const walletConnectConnection: Connection = {
  connector: web3WalletConnect,
  hooks: web3WalletConnectHooks,
  type: ConnectionType.WALLET_CONNECT,
}

const [web3Fortmatic, web3FortmaticHooks] = initializeConnector<Connector>((actions) => {
  return new AsyncConnector(
    () => {
      return Promise.all([import('fortmatic'), import('@web3-react/eip1193')]).then(([Fortmatic, { EIP1193 }]) => {
        return new EIP1193({
          actions,
          provider: new Fortmatic.default(process.env.REACT_APP_FORTMATIC_KEY).getProvider(),
        })
      })
    },
    actions,
    onError
  )
})
export const fortmaticConnection: Connection = {
  connector: web3Fortmatic,
  hooks: web3FortmaticHooks,
  type: ConnectionType.FORTMATIC,
}

const [web3CoinbaseWallet, web3CoinbaseWalletHooks] = initializeConnector<Connector>((actions) => {
  return new AsyncConnector(
    () => {
      return import('@web3-react/coinbase-wallet').then((module) => {
        return new module.CoinbaseWallet({
          actions,
          options: {
            url: RPC_URLS[SupportedChainId.MAINNET],
            appName: 'CoW Swap',
            appLogoUrl: COWSWAP_LOGO_URL,
            reloadOnDisconnect: false,
          },
          onError,
        })
      })
    },
    actions,
    onError
  )
})
export const coinbaseWalletConnection: Connection = {
  connector: web3CoinbaseWallet,
  hooks: web3CoinbaseWalletHooks,
  type: ConnectionType.COINBASE_WALLET,
}
