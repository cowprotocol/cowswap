import { useAccount, useConnect as useConnectWagmi } from 'wagmi'
import { useCallback, useMemo } from 'react'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { ConnectResult, PublicClient } from '@wagmi/core'

export function useConnect() {
  const { isConnected } = useAccount()
  const { openConnectModal } = useConnectModal()
  const { connectAsync, connectors } = useConnectWagmi()

  const [injectedConnector, hasInjectedProviderPromise] = useMemo(() => {
    const connector = connectors.find((c) => c.id === 'injected')

    if (!connector || typeof connector.getProvider !== 'function') {
      return [undefined, Promise.resolve(false)] as const
    }

    return [connector, connector.getProvider().then((p) => !!p)] as const
  }, [connectors])

  const connect = useCallback(async (): Promise<ConnectResult<PublicClient> | undefined> => {
    const hasInjectedProvider = await hasInjectedProviderPromise

    // Shows connect modal if there's no injected wallet
    if (!hasInjectedProvider || !injectedConnector) {
      console.debug('[useConnect] No injected connector or provider. Using connect modal')
      if (openConnectModal) {
        openConnectModal()
      }
      return undefined
    }

    if (!connectAsync) {
      console.debug('[useConnect] connectAsync is undefined')
      return undefined
    }

    // Connects with injected wallet (if available)
    console.debug('[useConnect] Connect using injected wallet')
    return connectAsync({
      connector: injectedConnector,
    })
  }, [connectAsync, injectedConnector, hasInjectedProviderPromise, openConnectModal])

  return {
    isConnected,
    connect,
  }
}
