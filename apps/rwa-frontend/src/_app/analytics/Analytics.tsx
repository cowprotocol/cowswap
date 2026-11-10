'use client'

import { type ReactNode, useEffect, useRef } from 'react'

import { useConnection } from 'wagmi'

import { areAddressesEqual } from '@cowprotocol/cow-sdk'

import { usePathname } from 'next/navigation'

import { loadGtm, setAnalyticsDimension, trackEvent } from '@/shared/lib/analytics'

interface ConnectedWallet {
  address: string
  name: string
}

const UNKNOWN_WALLET = 'Unknown'
const NOT_CONNECTED_WALLET_NAME = 'Not connected'

/** Loads GTM and tracks page views and wallet connections, see `docs/analytics.md` */
export function Analytics(): ReactNode {
  useEffect(() => loadGtm(), [])
  usePageViews()
  useWalletEvents()

  return null
}

function usePageViews(): void {
  const pathname = usePathname()

  useEffect(() => {
    trackEvent('page_view', { page_path: window.location.pathname })
  }, [pathname])
}

function useWalletEvents(): void {
  const { address, connector, chainId, status } = useConnection()
  const previousRef = useRef<ConnectedWallet | null>(null)

  useEffect(() => {
    setAnalyticsDimension('chainId', chainId === undefined ? undefined : String(chainId))
  }, [chainId])

  useEffect(() => {
    if (status === 'connecting' || status === 'reconnecting') return

    const previous = previousRef.current
    const current = status === 'connected' && address ? { address, name: connector?.name ?? UNKNOWN_WALLET } : null

    previousRef.current = current
    setAnalyticsDimension('userAddress', current?.address ?? 'disconnected')
    if (current) setAnalyticsDimension('walletName', current.name)

    trackEvent('set_user_account', { userId: current?.address })

    if (current && !previous) {
      trackEvent('wallet_connected', {
        eventType: 'wallet_initial_connection',
        walletAddress: current.address,
        walletName: current.name,
      })
    } else if (current && previous && !areAddressesEqual(current.address, previous.address)) {
      trackEvent('wallet_switched', {
        eventType: 'wallet_switch',
        walletAddress: current.address,
        walletName: current.name,
        previousWalletAddress: previous.address,
        previousWalletName: previous.name,
      })
    } else if (!current && previous) {
      trackEvent('wallet_disconnected', {
        eventType: 'wallet_disconnection',
        previousWalletAddress: previous.address,
        previousWalletName: previous.name,
      })
    }

    if (!current) setAnalyticsDimension('walletName', NOT_CONNECTED_WALLET_NAME)
  }, [address, connector, status])
}
