import { Connector } from '@web3-react/types'
import { ConnectionType } from 'modules/wallet'
import { getConnectionName } from 'modules/wallet/api/utils/connection'
import { useIsActiveWallet } from 'hooks/useIsActiveWallet'

import { ConnectWalletOption } from 'modules/wallet/api/pure/ConnectWalletOption'
import { default as LedgerImage } from 'modules/wallet/api/assets/ledger.svg'
import { initializeConnector } from '@web3-react/core'
import { Web3ReactConnection } from '../types'
import { RPC_URLS } from 'constants/networks'
import { AsyncConnector } from './asyncConnector'

const BASE_PROPS = {
  color: '#4196FC',
  icon: LedgerImage,
  id: 'ledger',
}

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
                  rpc: RPC_URLS,
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
