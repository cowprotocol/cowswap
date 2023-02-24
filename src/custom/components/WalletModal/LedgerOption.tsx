import { Connector } from '@web3-react/types'
import LEDGER_ICON_URL from 'assets/images/ledger.svg'
import { ConnectionType, ledgerConnection } from 'connection'
import { getConnectionName } from 'connection/utils'
import { useIsActiveWallet } from 'hooks/useIsActiveWallet'

import Option from 'components/WalletModal/Option'

const BASE_PROPS = {
  color: '#4196FC',
  icon: LEDGER_ICON_URL,
  id: 'ledger',
}

export function LedgerOption({ tryActivation }: { tryActivation: (connector: Connector) => void }) {
  const isActive = useIsActiveWallet(ledgerConnection)

  return (
    <Option
      {...BASE_PROPS}
      isActive={isActive}
      onClick={() => tryActivation(ledgerConnection.connector)}
      header={getConnectionName(ConnectionType.LEDGER)}
    />
  )
}
