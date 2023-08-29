import { useEffect } from 'react'

import { Connector } from '@web3-react/types'

import { useAppSelector } from 'legacy/state/hooks'

import { BACKFILLABLE_WALLETS } from 'modules/wallet/api/types'

import { isInjectedWidget } from 'common/utils/isInjectedWidget'
import { getCurrentChainIdFromUrl } from 'utils/getCurrentChainIdFromUrl'

import { getWeb3ReactConnection } from '../connection'
import { injectedWidgetConnection } from '../connection/injectedWidget'
import { networkConnection } from '../connection/network'
import { gnosisSafeConnection } from '../connection/safe'

async function connect(connector: Connector) {
  const chainId = getCurrentChainIdFromUrl()

  try {
    if (connector.connectEagerly) {
      await connector.connectEagerly(chainId)
    } else {
      await connector.activate(chainId)
    }
  } catch (error: any) {
    console.debug(`web3-react eager connection error: ${error}`)
  }
}

export function useEagerlyConnect() {
  const selectedWalletBackfilled = useAppSelector((state) => state.user.selectedWalletBackfilled)
  const selectedWallet = useAppSelector((state) => state.user.selectedWallet)

  useEffect(() => {
    if (isInjectedWidget()) {
      connect(injectedWidgetConnection.connector)
    }

    // Try to connect to Gnosis Safe only when the app is opened in an iframe
    if (window.top !== window.self) {
      connect(gnosisSafeConnection.connector)
    }

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
