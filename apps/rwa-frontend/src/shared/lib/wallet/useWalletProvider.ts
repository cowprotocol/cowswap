'use client'

import { useEffect, useState } from 'react'

import { useConnection } from 'wagmi'

import type { EthereumProvider } from '@cowprotocol/widget-lib'

/**
 * Reads the EIP-1193 provider off the active wagmi connector:
 * AppKit's `useAppKitProvider('eip155')` stays undefined for injected/EIP-6963 connectors.
 */
export function useWalletProvider(): EthereumProvider | undefined {
  const { connector } = useConnection()
  const [provider, setProvider] = useState<EthereumProvider | undefined>()

  useEffect(() => {
    if (!connector) {
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
