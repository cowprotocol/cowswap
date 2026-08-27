import { useAtom } from 'jotai'
import { MutableRefObject, useCallback, useEffect, useRef, useState } from 'react'

import { useInterval } from '@cowprotocol/common-hooks'
import { normalizeError } from '@cowprotocol/common-utils'
import { getAddressKey } from '@cowprotocol/cow-sdk'

import { bffTelegramApi } from '../api/bffTelegramApi'
import { TelegramSubscriptionState, telegramSubscriptionAtom } from '../atoms/telegramSubscriptionAtom'

const POLL_INTERVAL_MS = 3_000
const CONNECT_TIMEOUT_MS = 10 * 60 * 1000 // matches the bff connect-token TTL
// Unsubscribing happens on the bot side, so while the caller opts in (via `shouldPoll`,
// e.g. only while the settings panel showing the toggle is open) we keep polling for
// status changes to catch it and flip the toggle off without a page refresh.
const SUBSCRIBED_POLL_INTERVAL_MS = 5_000

const DEFAULT_SUBSCRIPTION_STATE: TelegramSubscriptionState = {
  isSubscribed: false,
  username: undefined,
  botDeepLink: undefined,
}

export type ConnectState = 'idle' | 'connecting' | 'expired' | 'error'

export interface TelegramConnectController {
  isLoading: boolean
  isSubscribed: boolean
  username?: string
  // Unsubscribing only happens from the bot side (tap its "Unsubscribe" button) - this
  // is a static link to open that chat, not a fresh single-use connect-token.
  botDeepLink: string | undefined
  connectState: ConnectState
  deepLink: string | null
  connect(): Promise<void>
  cancelConnect(): void
}

interface ConnectFlow {
  connectState: ConnectState
  deepLink: string | null
  connect(): Promise<void>
  cancelConnect(): void
}

export function useTelegramConnect(account: string | undefined, shouldPoll = false): TelegramConnectController {
  const [isLoading, setIsLoading] = useState(true)
  const [subscriptionByAccount, setSubscriptionByAccount] = useAtom(telegramSubscriptionAtom)

  // Always-fresh ref to the current `account`, used to discard results from
  // async calls that are still in flight when `account` changes or the hook unmounts.
  const accountRef = useRef(account)
  accountRef.current = account

  const accountKey = getAccountKey(account)
  const { isSubscribed, username, botDeepLink } =
    (accountKey && subscriptionByAccount[accountKey]) || DEFAULT_SUBSCRIPTION_STATE

  const refreshStatus = useCallback(async (): Promise<boolean> => {
    if (!account) return false
    const accountAtCall = account

    const status = await bffTelegramApi.getConnectStatus(accountAtCall)

    // Discard the result if the account changed while this request was in flight.
    if (accountRef.current !== accountAtCall) return status.connected

    setSubscriptionByAccount((prev) => ({
      ...prev,
      [getAddressKey(accountAtCall)]: {
        isSubscribed: status.connected,
        username: status.username,
        botDeepLink: status.botDeepLink,
      },
    }))

    return status.connected
  }, [account, setSubscriptionByAccount])

  const { connectState, deepLink, connect, cancelConnect } = useConnectFlow(account, accountRef, refreshStatus)

  useEffect(() => {
    const accountAtEffect = account

    if (!accountAtEffect) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    refreshStatus()
      .catch(() => undefined) // a failed background status check shouldn't surface a hard error
      .finally(() => {
        if (accountRef.current === accountAtEffect) setIsLoading(false)
      })
  }, [account, refreshStatus])

  // Keep polling while subscribed and the caller opts in (e.g. the settings panel
  // showing the toggle is open) so an unsubscribe done on the bot side is picked up
  // and the toggle flips off without needing a page refresh.
  useInterval(
    () => {
      refreshStatus().catch(() => undefined)
    },
    account && isSubscribed && shouldPoll ? SUBSCRIBED_POLL_INTERVAL_MS : null,
    false,
  )

  return { isLoading, isSubscribed, username, botDeepLink, connectState, deepLink, connect, cancelConnect }
}

function getAccountKey(account: string | undefined): string | undefined {
  return account ? getAddressKey(account) : undefined
}

/**
 * Owns the connect-token/QR/polling/expiry lifecycle for a single in-progress
 * connect attempt. Split out of useTelegramConnect() purely to keep that hook's
 * body short - this is not meant to be shared across multiple accounts at once.
 */
function useConnectFlow(
  account: string | undefined,
  accountRef: MutableRefObject<string | undefined>,
  refreshStatus: () => Promise<boolean>,
): ConnectFlow {
  const [connectState, setConnectState] = useState<ConnectState>('idle')
  const [deepLink, setDeepLink] = useState<string | null>(null)

  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const expiryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const stopConnecting = useCallback(() => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current)
    if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current)
    pollTimerRef.current = null
    expiryTimerRef.current = null
  }, [])

  // Reset any connect attempt bound to the previous account so stale timers/UI
  // state don't leak across account switches, and stop timers on unmount.
  useEffect(() => {
    stopConnecting()
    setConnectState('idle')
    setDeepLink(null)
  }, [account, stopConnecting])
  useEffect(() => stopConnecting, [stopConnecting])

  const connect = useCallback(async () => {
    if (!account) return
    const accountAtCall = account

    // Clear any previous polling/expiry timers so a re-entrant connect() call
    // (e.g. a double-click before the trigger is disabled) can't orphan them.
    stopConnecting()

    // Open the modal immediately (it shows a "preparing" message while deepLink is
    // still null) instead of waiting for getConnectToken to resolve, so there's no
    // silent gap between the click and the QR code appearing.
    setDeepLink(null)
    setConnectState('connecting')

    let link: string
    try {
      const data = await bffTelegramApi.getConnectToken(accountAtCall)
      link = data.deepLink
    } catch (err: unknown) {
      if (accountRef.current !== accountAtCall) return
      const error = normalizeError(err)
      console.error('[useTelegramConnect] Failed to start the Telegram connect flow', error)
      setConnectState('error')
      return
    }

    if (accountRef.current !== accountAtCall) return

    setDeepLink(link)

    pollTimerRef.current = setInterval(() => {
      refreshStatus()
        .then((connected) => {
          // Discard results from a poll tick bound to a stale account (e.g. the
          // user switched accounts and started a new connect() attempt) so it
          // can't clobber the current connect flow's state.
          if (connected && accountRef.current === accountAtCall) {
            stopConnecting()
            setConnectState('idle')
            setDeepLink(null)
          }
        })
        .catch(() => undefined)
    }, POLL_INTERVAL_MS)

    expiryTimerRef.current = setTimeout(() => {
      stopConnecting()
      setConnectState('expired')
      setDeepLink(null)
    }, CONNECT_TIMEOUT_MS)
  }, [account, accountRef, refreshStatus, stopConnecting])

  const cancelConnect = useCallback(() => {
    stopConnecting()
    setConnectState('idle')
    setDeepLink(null)
  }, [stopConnecting])

  return { connectState, deepLink, connect, cancelConnect }
}
