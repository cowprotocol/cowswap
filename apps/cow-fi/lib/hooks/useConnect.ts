import { useAccount, useConnect as useConnectWagmi } from 'wagmi'
import { useCallback, useEffect, useState } from 'react'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { ConnectResult, PublicClient } from '@wagmi/core'
import { useCowAnalytics } from '@cowprotocol/analytics'
import { CowFiCategory } from 'src/common/analytics/types'

export function useConnect() {
  const { isConnected } = useAccount()
  const { openConnectModal } = useConnectModal()
  const { connectAsync, connectors } = useConnectWagmi()
  const cowAnalytics = useCowAnalytics()
  const [connectionPromise, setConnectionPromise] = useState<Promise<ConnectResult<PublicClient> | undefined> | null>(
    null,
  )

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

  const connect = useCallback((): Promise<ConnectResult<PublicClient> | undefined> => {
    console.debug('[useConnect] Initiating connection')

    const promise = new Promise<ConnectResult<PublicClient> | undefined>((resolve, reject) => {
      if (openConnectModal) {
        console.debug('[useConnect] Showing connect modal')
        openConnectModal()
      }

      const checkConnection = setInterval(async () => {
        if (isConnected) {
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
