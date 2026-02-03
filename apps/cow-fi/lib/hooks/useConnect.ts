import { useCallback, useEffect, useState } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'

import { useConnectModal } from '@rainbow-me/rainbowkit'
import { ConnectReturnType } from '@wagmi/core'
import { CowFiCategory } from 'src/common/analytics/types'
import { useAccount, useConnectors, useConnect as useConnectWagmi } from 'wagmi'

export function useConnect() {
  const { isConnected } = useAccount()
  const { openConnectModal } = useConnectModal()
  const connectors = useConnectors()
  const { mutateAsync: connectAsync } = useConnectWagmi()
  const cowAnalytics = useCowAnalytics()
  const [connectionPromise, setConnectionPromise] = useState<Promise<ConnectReturnType | undefined> | null>(null)

  const injectedConnector = connectors.find((c) => c.id === 'injected')

  useEffect(() => {
    if (isConnected && connectionPromise) {
      // Track successful connection
      cowAnalytics.sendEvent({
        category: CowFiCategory.MEVBLOCKER,
        action: 'Wallet Connected',
      })
      setConnectionPromise(null)
    }
  }, [isConnected, connectionPromise, cowAnalytics])

  const connect = useCallback((): Promise<ConnectReturnType | undefined> => {
    console.debug('[useConnect] Initiating connection')

    const promise = new Promise<ConnectReturnType | undefined>((resolve, reject) => {
      if (openConnectModal) {
        console.debug('[useConnect] Showing connect modal')
        openConnectModal()
      }

      const checkConnection = setInterval(async () => {
        if (isConnected && injectedConnector) {
          clearInterval(checkConnection)
          try {
            const result = await connectAsync({ connector: injectedConnector })
            resolve(result)
          } catch (error) {
            reject(error)
          }
        }
      }, 500)
    })

    setConnectionPromise(promise)
    return promise
  }, [connectAsync, injectedConnector, openConnectModal, isConnected])

  return {
    isConnected,
    connect,
  }
}
