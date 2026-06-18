import { useEffect, useRef } from 'react'

import { useConnection } from 'wagmi'

import { SAFE_CONNECTOR_ID } from '../reown/consts'
import { connectWalletById } from '../utils/connectWalletById'
import { getIsSafeAppIframe } from '../utils/getIsSafeAppIframe'
import { useDisconnectWallet } from '../wagmi/hooks/useDisconnectWallet'

/**
 * The updater makes sure that in Safe App you can be connected only to Safe App
 * In case if the app tries to be connected to any other connector, it will disconnect it
 * And connect to Safe App
 */
export function WidgetSafeApp(): null {
  const { connector } = useConnection()
  const disconnect = useDisconnectWallet()

  const isSafeApp = getIsSafeAppIframe()
  const isSafeConnector = connector?.id === 'safe'
  const isDisconnectInProgress = useRef(false)

  useEffect(() => {
    if (!connector || !isSafeApp) return
    if (isDisconnectInProgress.current) return

    if (!isSafeConnector) {
      console.debug('[WidgetSafeApp] disconnect connector', { connector })

      isDisconnectInProgress.current = true

      disconnect().finally(() => {
        isDisconnectInProgress.current = false

        connectWalletById(SAFE_CONNECTOR_ID, 'safe')
      })
    }
  }, [disconnect, connector, isSafeApp, isSafeConnector])

  return null
}
