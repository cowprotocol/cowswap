import { ReactNode } from 'react'

import { RPC_URLS } from '@cowprotocol/common-const'
import { getCurrentChainIdFromUrl } from '@cowprotocol/common-utils'
import { ALL_SUPPORTED_CHAIN_IDS, SupportedChainId } from '@cowprotocol/cow-sdk'
import { initializeConnector } from '@web3-react/core'
import { Connector } from '@web3-react/types'

import { onError } from './onError'

import { default as CoinbaseImage } from '../../api/assets/coinbase.svg'
import { ConnectWalletOption } from '../../api/pure/ConnectWalletOption'
import { ConnectionType } from '../../api/types'
import { WC_PROJECT_ID } from '../../constants'
import { WalletConnectV2Connector } from '../connectors/WalletConnectV2Connector'
import { useIsActiveConnection } from '../hooks/useIsActiveConnection'
import { ConnectionOptionProps, Web3ReactConnection } from '../types'
import { coinbaseDebug } from '../utils/coinbaseDebugLogger'

// Coinbase Wallet's WalletConnect v2 registry ID
const COINBASE_WALLET_WC_ID = 'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa'

const coinbaseAppOption = {
  color: '#315CF5',
  icon: CoinbaseImage,
  id: 'coinbase-wallet-app',
}

// Per-chain cache — same pattern as walletConnectV2.tsx
const cbWcConnections = new Map<SupportedChainId, Web3ReactConnection>()

function createCoinbaseWcConnection(chainId: SupportedChainId): Web3ReactConnection {
  coinbaseDebug('createCoinbaseWcConnection', { chainId })

  const [connector, hooks] = initializeConnector<WalletConnectV2Connector>(
    (actions) =>
      new WalletConnectV2Connector({
        actions,
        onError,
        options: {
          projectId: WC_PROJECT_ID,
          chains: [chainId],
          optionalChains: ALL_SUPPORTED_CHAIN_IDS,
          rpcMap: RPC_URLS,
          showQrModal: true,
          qrModalOptions: {
            explorerRecommendedWalletIds: [COINBASE_WALLET_WC_ID],
            explorerExcludedWalletIds: 'ALL',
          },
        },
      }),
  )

  return { connector, hooks, type: ConnectionType.WALLET_CONNECT_V2 }
}

export function getCoinbaseWcConnection(chainId: SupportedChainId = getCurrentChainIdFromUrl()): Web3ReactConnection {
  let connection = cbWcConnections.get(chainId)

  if (!connection) {
    connection = createCoinbaseWcConnection(chainId)
    cbWcConnections.set(chainId, connection)
  }

  return connection
}

/** Check if a connector instance belongs to a Coinbase-via-WC connection */
export function isCoinbaseWcConnector(c: Connector): boolean {
  return Array.from(cbWcConnections.values()).some((conn) => conn.connector === c)
}

export function CoinbaseWalletAppOption({ tryActivation, selectedWallet }: ConnectionOptionProps): ReactNode {
  const chainId = getCurrentChainIdFromUrl()
  const connection = getCoinbaseWcConnection(chainId)
  const isActive = useIsActiveConnection(selectedWallet, connection)

  return (
    <ConnectWalletOption
      {...coinbaseAppOption}
      isActive={isActive}
      onClick={() => {
        coinbaseDebug('CoinbaseWalletAppOption clicked')
        tryActivation(connection.connector)
      }}
      header="Coinbase Wallet App"
      subheader="via WalletConnect"
    />
  )
}
