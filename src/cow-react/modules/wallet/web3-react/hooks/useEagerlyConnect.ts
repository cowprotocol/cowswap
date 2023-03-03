import { Connector } from '@web3-react/types'
import { networkConnection } from '@cow/modules/wallet/web3-react/connection/network'
import { gnosisSafeConnection } from '@cow/modules/wallet/web3-react/connection/safe'
import { getWeb3ReactConnection } from '@cow/modules/wallet/web3-react/connection'
import { useEffect } from 'react'
import { useAppSelector } from 'state/hooks'
import { BACKFILLABLE_WALLETS } from '@cow/modules/wallet/api/types'

async function connect(connector: Connector) {
  try {
    if (connector.connectEagerly) {
      await connector.connectEagerly()
    } else {
      await connector.activate()
    }
  } catch (error: any) {
    console.debug(`web3-react eager connection error: ${error}`)
  }
}

export default function useEagerlyConnect() {
  const selectedWalletBackfilled = useAppSelector((state) => state.user.selectedWalletBackfilled)
  const selectedWallet = useAppSelector((state) => state.user.selectedWallet)

  useEffect(() => {
    connect(gnosisSafeConnection.connector)
    connect(networkConnection.connector)

    if (selectedWallet) {
      connect(getWeb3ReactConnection(selectedWallet).connector)
    } else if (!selectedWalletBackfilled) {
      BACKFILLABLE_WALLETS.map(getWeb3ReactConnection)
        .map((connection) => connection.connector)
        .forEach(connect)
    }
    // The dependency list is empty so this is only run once on mount
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}
