import { useState, useSyncExternalStore } from 'react'

import { RPC_URLS } from '@cowprotocol/common-const'
import { getCurrentChainIdFromUrl } from '@cowprotocol/common-utils'
import { ALL_SUPPORTED_CHAIN_IDS, SupportedChainId } from '@cowprotocol/cow-sdk'
import { Command } from '@cowprotocol/types'
import { initializeConnector, Web3ReactHooks } from '@web3-react/core'
import { Web3ReactStore } from '@web3-react/types'

import { ASYNC_CUSTOM_PROVIDER_EVENT, AsyncConnector } from './asyncConnector'
import { onError } from './onError'

import { default as WalletConnectV2Image } from '../../api/assets/walletConnectIcon.svg'
import { ConnectWalletOption } from '../../api/pure/ConnectWalletOption'
import { ConnectionType } from '../../api/types'
import { getConnectionName } from '../../api/utils/connection'
import { WC_PROJECT_ID } from '../../constants'
import { useIsActiveConnection } from '../hooks/useIsActiveConnection'
import { ConnectionOptionProps, Web3ReactConnection } from '../types'

export const walletConnectV2Option = {
  color: '#4196FC',
  icon: WalletConnectV2Image,
  id: 'wallet-connect-v2',
}

function createWalletConnectV2Connector(chainId: SupportedChainId): [AsyncConnector, Web3ReactHooks, Web3ReactStore] {
  return initializeConnector<AsyncConnector>(
    (actions) =>
      new AsyncConnector(
        () =>
          import('../connectors/WalletConnectV2Connector').then(
            (m) =>
              new m.WalletConnectV2Connector({
                actions,
                onError(error) {
                  console.error('WalletConnect2 ERROR:', error)
                },
                options: {
                  projectId: WC_PROJECT_ID,
                  chains: [chainId],
                  optionalChains: ALL_SUPPORTED_CHAIN_IDS,
                  showQrModal: true,
                  rpcMap: RPC_URLS,
                },
              })
          ),
        actions,
        onError
      )
  )
}

/**
 * Copy-pasted solution from https://github.com/Uniswap/interface/blob/main/src/connection/index.ts#L85
 *
 * Why do we need this:
 * WC2 connector can be created once per network
 *
 * Let's consider the case:
 *
 *  - Connect via WC2 to Mainnet
 *  - Disconnect
 *  - Try to connect to Gnosis Chain via WC2
 *
 * In this case, the connection won't be established, because at step 1 the WC2 connector was created for chainId=1.
 * To overcome this problem we proxy WC2 connection and change it's implementation on flight on network changes.
 */
// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
function createWc2Connection(chainId = getCurrentChainIdFromUrl()): Web3ReactConnection {
  let [web3WalletConnectV2, web3WalletConnectV2Hooks] = createWalletConnectV2Connector(chainId)

  web3WalletConnectV2Hooks.useProvider = function useProvider<T>() {
    const [customProvider, setCustomProvider] = useState<T | undefined>(undefined)

    web3WalletConnectV2.events.on(ASYNC_CUSTOM_PROVIDER_EVENT, setCustomProvider)

    return customProvider
  }

  let onActivate: Command | undefined

  const proxyConnector = new Proxy(
    {},
    {
      get: (target, p, receiver) => Reflect.get(web3WalletConnectV2, p, receiver),
      getOwnPropertyDescriptor: (target, p) => Reflect.getOwnPropertyDescriptor(web3WalletConnectV2, p),
      getPrototypeOf: () => AsyncConnector.prototype,
      set: (target, p, receiver) => Reflect.set(web3WalletConnectV2, p, receiver),
    }
  ) as typeof web3WalletConnectV2

  const proxyHooks = new Proxy(
    {},
    {
      get: (target, p, receiver) => {
        return () => {
          // Because our connectors are referentially stable (through proxying), we need a way to trigger React renders
          // from outside of the React lifecycle when our connector is re-initialized. This is done via 'change' events
          // with `useSyncExternalStore`:
          const hooks = useSyncExternalStore(
            (onChange) => {
              onActivate = onChange
              return () => (onActivate = undefined)
            },
            () => web3WalletConnectV2Hooks
          )
          return Reflect.get(hooks, p, receiver)()
        }
      },
    }
  ) as typeof web3WalletConnectV2Hooks

  return {
    get connector() {
      return proxyConnector
    },
    get hooks() {
      return proxyHooks
    },
    type: ConnectionType.WALLET_CONNECT_V2,
    overrideActivate(chainId: SupportedChainId) {
      const update = createWalletConnectV2Connector(chainId)
      web3WalletConnectV2 = update[0]
      web3WalletConnectV2Hooks = update[1]

      onActivate?.()
      return false
    },
  }
}

export const walletConnectConnectionV2 = createWc2Connection()

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function WalletConnectV2Option({ selectedWallet, tryActivation }: ConnectionOptionProps) {
  const isActive = useIsActiveConnection(selectedWallet, walletConnectConnectionV2)

  return (
    <ConnectWalletOption
      {...walletConnectV2Option}
      isActive={isActive}
      clickable={!isActive}
      onClick={() => tryActivation(walletConnectConnectionV2.connector)}
      header={getConnectionName(ConnectionType.WALLET_CONNECT_V2)}
    />
  )
}
