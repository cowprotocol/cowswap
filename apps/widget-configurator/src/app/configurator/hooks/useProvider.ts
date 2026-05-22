import { useEffect, useState } from 'react'

import { EthereumProvider } from '@cowprotocol/widget-lib'

import { useConnection } from 'wagmi'

/**
 * Returns the active wallet's EIP-1193 provider for the widget's dapp mode.
 *
 * Reads the provider straight off the active wagmi connector. AppKit's
 * `useAppKitProvider('eip155')` looks reliable but it only populates
 * `ChainController.state.providers` for the WalletConnect / Coinbase Wallet SDK
 * path — for EIP-6963 / injected connectors it can return undefined, leaving
 * the widget iframe without a provider and stuck on the connect screen.
 */
export function useProvider(): EthereumProvider | undefined {
  const { connector } = useConnection()
  const [provider, setProvider] = useState<EthereumProvider | undefined>()

  useEffect(() => {
    if (!connector || typeof connector.getProvider !== 'function') {
      setProvider(undefined)
      return
    }

    let cancelled = false
    connector
      .getProvider()
      .then((next) => {
        if (!cancelled) setProvider(next as EthereumProvider)
      })
      .catch(() => {
        if (!cancelled) setProvider(undefined)
      })

    return () => {
      cancelled = true
    }
  }, [connector])

  return provider
}
