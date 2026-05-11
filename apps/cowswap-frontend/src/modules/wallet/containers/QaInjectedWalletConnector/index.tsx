import { useEffect, type ReactNode } from 'react'

import { QA_CONNECT_INJECTED_WALLET_EVENT } from '@cowprotocol/common-const/qa'

import { useConnect, useConnectors } from 'wagmi'

const ENABLE_QA_INJECTED_WALLET = process.env.REACT_APP_ENABLE_QA_INJECTED_WALLET === 'true'

export function QaInjectedWalletConnector(): ReactNode {
  const connectors = useConnectors()
  const { mutateAsync: connect } = useConnect()

  useEffect(() => {
    if (!ENABLE_QA_INJECTED_WALLET) return

    const handler = (): void => {
      const injectedConnector = connectors.find((connector) => connector.id === 'injected')

      if (!injectedConnector) return

      void connect({ connector: injectedConnector }).catch((error: unknown) => {
        console.error('[QaInjectedWalletConnector] failed', error)
      })
    }

    document.addEventListener(QA_CONNECT_INJECTED_WALLET_EVENT, handler)

    return () => document.removeEventListener(QA_CONNECT_INJECTED_WALLET_EVENT, handler)
  }, [connect, connectors])

  return null
}
