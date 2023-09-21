import { useSyncExternalStore } from 'react'

import { ALL_SUPPORTED_CHAIN_IDS, SupportedChainId } from '@cowprotocol/cow-sdk'
import { initializeConnector, Web3ReactHooks } from '@web3-react/core'
import { Web3ReactStore } from '@web3-react/types'

import { default as WalletConnectV2Image } from '../../api/assets/wallet-connect-v2.png'
import { ConnectWalletOption } from '../../api/pure/ConnectWalletOption'
import { ConnectionType } from '../../api/types'
import {
  getConnectionName,
  getIsAlphaWallet,
  getIsAmbireWallet,
  getIsTrustWallet,
  getIsZengoWallet,
} from '../../api/utils/connection'
import { WC_DISABLED_TEXT } from '../../constants'
import { WalletConnectV2Connector } from '../connectors/WalletConnectV2Connector'
import { useWalletMetaData } from '../hooks/useWalletMetadata'
import { ConnectionOptionProps, Web3ReactConnection } from '../types'

import { useIsActiveConnection } from '../hooks/useIsActiveConnection'
import { RPC_URLS } from '@cowprotocol/common-const'
import { getCurrentChainIdFromUrl } from '@cowprotocol/common-utils'

const TOOLTIP_TEXT =
  'Currently in development and not widely adopted yet. If you are experiencing issues, contact your wallet provider.'

export const walletConnectV2Option = {
  color: '#4196FC',
  icon: WalletConnectV2Image,
  id: 'wallet-connect-v2',
}

const WC_PROJECT_ID = process.env.REACT_APP_WC_PROJECT_ID
const WC_DEFAULT_PROJECT_ID = 'a6cc11517a10f6f12953fd67b1eb67e7'

function createWalletConnectV2Connector(
  chainId: SupportedChainId
): [WalletConnectV2Connector, Web3ReactHooks, Web3ReactStore] {
  return initializeConnector<WalletConnectV2Connector>(
    (actions) =>
      new WalletConnectV2Connector({
        actions,
        onError(error) {
          console.error('WalletConnect2 ERROR:', error)
        },
        options: {
          projectId: WC_PROJECT_ID || WC_DEFAULT_PROJECT_ID,
          chains: [chainId],
          optionalChains: ALL_SUPPORTED_CHAIN_IDS,
          showQrModal: true,
          rpcMap: RPC_URLS,
        },
      })
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
function createWc2Connection(chainId = getCurrentChainIdFromUrl()): Web3ReactConnection {
  let [web3WalletConnectV2, web3WalletConnectV2Hooks] = createWalletConnectV2Connector(chainId)

  let onActivate: (() => void) | undefined

  const proxyConnector = new Proxy(
    {},
    {
      get: (target, p, receiver) => Reflect.get(web3WalletConnectV2, p, receiver),
      getOwnPropertyDescriptor: (target, p) => Reflect.getOwnPropertyDescriptor(web3WalletConnectV2, p),
      getPrototypeOf: () => WalletConnectV2Connector.prototype,
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

export function WalletConnectV2Option({ selectedWallet, tryActivation }: ConnectionOptionProps) {
  const { walletName } = useWalletMetaData()

  const isWalletConnect = useIsActiveConnection(selectedWallet, walletConnectConnectionV2)
  const isActive =
    isWalletConnect &&
    !getIsZengoWallet(walletName) &&
    !getIsAmbireWallet(walletName) &&
    !getIsAlphaWallet(walletName) &&
    !getIsTrustWallet(walletName)

  const tooltipText = !isActive && isWalletConnect ? WC_DISABLED_TEXT : TOOLTIP_TEXT

  return (
    <ConnectWalletOption
      {...walletConnectV2Option}
      isActive={isActive}
      tooltipText={tooltipText}
      clickable={!isWalletConnect}
      onClick={() => tryActivation(walletConnectConnectionV2.connector)}
      header={getConnectionName(ConnectionType.WALLET_CONNECT_V2)}
    />
  )
}
