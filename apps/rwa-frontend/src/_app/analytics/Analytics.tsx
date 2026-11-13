'use client'

import { type ReactNode, useEffect, useRef } from 'react'

import { useConnection } from 'wagmi'

import { useHasAcceptedCookies } from '@cowprotocol/analytics/consent'
import { areAddressesEqual } from '@cowprotocol/cow-sdk'

import { usePathname } from 'next/navigation'

import { loadGtm, setAnalyticsDimension, trackEvent } from '@/shared/lib/analytics'

interface ConnectedWallet {
  address: string
  name: string
}

const UNKNOWN_WALLET = 'Unknown'
const NOT_CONNECTED_WALLET_NAME = 'Not connected'

/** Loads GTM and tracks page views and wallet connections once cookies are accepted, see `docs/analytics.md` */
export function Analytics(): ReactNode {
  const isAccepted = useHasAcceptedCookies()

  useEffect(() => {
    if (isAccepted) loadGtm()
  }, [isAccepted])
  usePageViews(isAccepted)
  useWalletEvents(isAccepted)

  return null
}

function trackWalletChange(current: ConnectedWallet | null, previous: ConnectedWallet | null): void {
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
}

function usePageViews(isAccepted: boolean): void {
  const pathname = usePathname()

  useEffect(() => {
    if (!isAccepted) return

    trackEvent('page_view', { page_path: window.location.pathname })
  }, [pathname, isAccepted])
}

function useWalletEvents(isAccepted: boolean): void {
  const { address, connector, chainId, status } = useConnection()
  const previousRef = useRef<ConnectedWallet | null>(null)

  useEffect(() => {
    setAnalyticsDimension('chainId', chainId === undefined ? undefined : String(chainId))
  }, [chainId])

  useEffect(() => {
    if (status === 'connecting' || status === 'reconnecting') return

    const previous = previousRef.current
    const current = status === 'connected' && address ? { address, name: connector?.name ?? UNKNOWN_WALLET } : null

    previousRef.current = isAccepted ? current : null
    setAnalyticsDimension('userAddress', current?.address ?? 'disconnected')
    if (current) setAnalyticsDimension('walletName', current.name)

    // During hydration the hook still reports the server snapshot while the store already holds an earlier Accept
    if (isAccepted) trackWalletChange(current, previous)

    if (!current) setAnalyticsDimension('walletName', NOT_CONNECTED_WALLET_NAME)
  }, [address, connector, status, isAccepted])
}
