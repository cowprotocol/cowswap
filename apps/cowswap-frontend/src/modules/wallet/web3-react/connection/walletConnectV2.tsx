import { useSyncExternalStore } from 'react'

import { ALL_SUPPORTED_CHAIN_IDS, SupportedChainId } from '@cowprotocol/cow-sdk'
import { initializeConnector, Web3ReactHooks } from '@web3-react/core'
import { Web3ReactStore } from '@web3-react/types'

import { RPC_URLS } from 'legacy/constants/networks'
import { useIsActiveWallet } from 'legacy/hooks/useIsActiveWallet'

import { ConnectionType, useWalletMetaData } from 'modules/wallet'
import { default as WalletConnectV2Image } from 'modules/wallet/api/assets/wallet-connect-v2.png'
import { ConnectWalletOption } from 'modules/wallet/api/pure/ConnectWalletOption'
import {
  getConnectionName,
  getIsAlphaWallet,
  getIsAmbireWallet,
  getIsTrustWallet,
  getIsZengoWallet,
} from 'modules/wallet/api/utils/connection'
import { WC_DISABLED_TEXT } from 'modules/wallet/constants'

import { getCurrentChainIdFromUrl } from 'utils/getCurrentChainIdFromUrl'

import { WalletConnectV2Connector } from '../connectors/WalletConnectV2Connector'
import { Web3ReactConnection } from '../types'

import { TryActivation } from '.'

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

export function WalletConnectV2Option({ tryActivation }: { tryActivation: TryActivation }) {
  const { walletName } = useWalletMetaData()

  const isWalletConnect = useIsActiveWallet(walletConnectConnectionV2)
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
