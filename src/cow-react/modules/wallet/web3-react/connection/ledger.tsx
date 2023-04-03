import { Connector } from '@web3-react/types'
import { ConnectionType } from '@cow/modules/wallet'
import { getConnectionName } from '@cow/modules/wallet/api/utils/connection'
import { useIsActiveWallet } from 'hooks/useIsActiveWallet'

import { ConnectWalletOption } from '@cow/modules/wallet/api/pure/ConnectWalletOption'
import { default as LedgerImage } from '@cow/modules/wallet/api/assets/ledger.svg'
import { initializeConnector } from '@web3-react/core'
import { Web3ReactConnection } from '../types'
import { RPC_URLS } from 'constants/networks'
import { Ledger } from '../connectors/LedgerConnector'

const BASE_PROPS = {
  color: '#4196FC',
  icon: LedgerImage,
  id: 'ledger',
}

const [ledger, ledgerHooks] = initializeConnector<Ledger>(
  (actions) =>
    new Ledger({
      actions,
      options: {
        rpc: RPC_URLS,
      },
    })
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
