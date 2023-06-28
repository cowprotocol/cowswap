import { initializeConnector } from '@web3-react/core'
import { Connector } from '@web3-react/types'

import { RPC_URLS } from 'legacy/constants/networks'
import { useIsActiveWallet } from 'legacy/hooks/useIsActiveWallet'

import { ConnectionType } from 'modules/wallet'
import { default as LedgerImage } from 'modules/wallet/api/assets/ledger.svg'
import { ConnectWalletOption } from 'modules/wallet/api/pure/ConnectWalletOption'
import { getConnectionName } from 'modules/wallet/api/utils/connection'
import { WC_DEFAULT_PROJECT_ID } from 'modules/wallet/constants'

import { AsyncConnector } from './asyncConnector'

import { Web3ReactConnection } from '../types'

const WC_PROJECT_ID = process.env.REACT_APP_WC_PROJECT_ID

const BASE_PROPS = {
  color: '#4196FC',
  icon: LedgerImage,
  id: 'ledger',
}

const [mainnet, ...optionalChains] = Object.keys(RPC_URLS).map(Number)

const [ledger, ledgerHooks] = initializeConnector<AsyncConnector>(
  (actions) =>
    new AsyncConnector(
      () =>
        Promise.all([import('../connectors/LedgerConnector'), import('@ledgerhq/connect-kit-loader')]).then(
          ([m, { loadConnectKit }]) =>
            loadConnectKit().then((kit) => {
              return new m.Ledger({
                actions,
                options: {
                  walletConnectVersion: 2,
                  rpcMap: RPC_URLS,
                  projectId: WC_PROJECT_ID || WC_DEFAULT_PROJECT_ID,
                  chains: [mainnet],
                  optionalChains,
                },
                kit,
              })
            })
        ),
      actions
    )
)

export const ledgerConnection: Web3ReactConnection = {
  connector: ledger,
  hooks: ledgerHooks,
  type: ConnectionType.LEDGER,
}

export function LedgerOption({ tryActivation }: { tryActivation: (connector: Connector) => void }) {
  const isActive = useIsActiveWallet(ledgerConnection)

  return (
    <ConnectWalletOption
      {...BASE_PROPS}
      isActive={isActive}
      onClick={() => tryActivation(ledgerConnection.connector)}
      header={getConnectionName(ConnectionType.LEDGER)}
    />
  )
}
