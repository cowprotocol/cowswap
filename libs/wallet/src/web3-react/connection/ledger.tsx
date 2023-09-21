import { initializeConnector } from '@web3-react/core'

import { AsyncConnector } from './asyncConnector'

import { default as LedgerImage } from '../../api/assets/ledger.svg'
import { ConnectWalletOption } from '../../api/pure/ConnectWalletOption'
import { ConnectionType } from '../../api/types'
import { getConnectionName } from '../../api/utils/connection'
import { ConnectionOptionProps, Web3ReactConnection } from '../types'
import { useIsActiveConnection } from '../hooks/useIsActiveConnection'
import { RPC_URLS } from '@cowprotocol/common-const'

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

export function LedgerOption({ selectedWallet, tryActivation }: ConnectionOptionProps) {
  const isActive = useIsActiveConnection(selectedWallet, ledgerConnection)

  return (
    <ConnectWalletOption
      {...BASE_PROPS}
      isActive={isActive}
      onClick={() => tryActivation(ledgerConnection.connector)}
      header={getConnectionName(ConnectionType.LEDGER)}
    />
  )
}
