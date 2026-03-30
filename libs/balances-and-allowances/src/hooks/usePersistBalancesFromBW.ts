import { useSetAtom } from 'jotai'
import { useCallback, useEffect, useRef } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { BigNumber } from '@ethersproject/bignumber'

import { BwSessionParams, createBwSession, getBwSseUrl, updateBwSession } from '../services/balanceWatcherApi'
import { balancesAtom, BalancesState, balancesUpdateAtom } from '../state/balancesAtom'
import { useSetIsBalanceWatcherFailed } from '../state/isBalanceWatcherFailedAtom'

const MAX_RECONNECT_DELAY = 60_000
const BASE_RECONNECT_DELAY = 1_000

export interface PersistBalancesFromBWParams {
  account: string | undefined
  chainId: SupportedChainId
  tokenListUrls: string[]
  customTokenAddresses: string[]
}

// eslint-disable-next-line max-lines-per-function
export function usePersistBalancesFromBW({
  account,
  chainId,
  tokenListUrls,
  customTokenAddresses,
}: PersistBalancesFromBWParams): void {
  const setBalances = useSetAtom(balancesAtom)
  const setBalancesUpdate = useSetAtom(balancesUpdateAtom)
  const setIsBalanceWatcherFailed = useSetIsBalanceWatcherFailed()

  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectAttemptRef = useRef(0)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isFirstEventRef = useRef(true)
  const accumulatedBalancesRef = useRef<BalancesState['values']>({})

  // Keep latest values in refs for stable callback references
  const tokenListUrlsRef = useRef(tokenListUrls)
  tokenListUrlsRef.current = tokenListUrls
  const customTokenAddressesRef = useRef(customTokenAddresses)
  customTokenAddressesRef.current = customTokenAddresses
  const chainIdRef = useRef(chainId)
  chainIdRef.current = chainId

  const writeBalances = useCallback(
    (balancesValues: BalancesState['values'], targetAccount: string) => {
      const currentChainId = chainIdRef.current

      setBalances((state) => ({
        ...state,
        chainId: currentChainId,
        fromCache: false,
        hasFirstLoad: true,
        error: null,
        values: balancesValues,
        isLoading: false,
      }))

      setBalancesUpdate((state) => ({
        ...state,
        [currentChainId]: {
          ...state[currentChainId],
          [targetAccount.toLowerCase()]: Date.now(),
        },
      }))
    },
    [setBalances, setBalancesUpdate],
  )

  // Use a ref to break the circular dependency between connectSse and scheduleReconnect
  const connectSseRef = useRef<((targetAccount: string) => Promise<void>) | null>(null)

  const scheduleReconnect = useCallback((targetAccount: string) => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current)
    }

    const delay = Math.min(BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttemptRef.current), MAX_RECONNECT_DELAY)
    reconnectAttemptRef.current += 1

    reconnectTimerRef.current = setTimeout(() => {
      reconnectTimerRef.current = null
      connectSseRef.current?.(targetAccount)
    }, delay)
  }, [])

  const connectSse = useCallback(
    async (targetAccount: string) => {
      // Close existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }

      const currentChainId = chainIdRef.current
      const sessionParams: BwSessionParams = {
        tokensListsUrls: tokenListUrlsRef.current,
        customTokens: customTokenAddressesRef.current,
      }

      try {
        await createBwSession(currentChainId, targetAccount, sessionParams)
      } catch (e) {
        console.warn('[BW] Failed to create session:', e)
        setIsBalanceWatcherFailed(true)
        setBalances((state) => ({
          ...state,
          error: e instanceof Error ? e.message : String(e),
          isLoading: false,
        }))
        scheduleReconnect(targetAccount)
        return
      }

      const sseUrl = getBwSseUrl(currentChainId, targetAccount)
      const es = new EventSource(sseUrl)
      eventSourceRef.current = es
      isFirstEventRef.current = true

      es.addEventListener('balance_update', (event: MessageEvent) => {
        try {
          const data: { balances: Record<string, string> } = JSON.parse(event.data)

          const parsedBalances = Object.entries(data.balances).reduce<BalancesState['values']>(
            (acc, [address, amount]) => {
              acc[address.toLowerCase()] = BigNumber.from(amount)
              return acc
            },
            {},
          )

          if (isFirstEventRef.current) {
            // First event = full snapshot, replace everything
            accumulatedBalancesRef.current = parsedBalances
            isFirstEventRef.current = false
          } else {
            // Subsequent events = diffs, merge into accumulated state
            accumulatedBalancesRef.current = {
              ...accumulatedBalancesRef.current,
              ...parsedBalances,
            }
          }

          writeBalances({ ...accumulatedBalancesRef.current }, targetAccount)

          // Reset reconnect counter on successful message
          reconnectAttemptRef.current = 0
          setIsBalanceWatcherFailed(false)
        } catch (e) {
          console.warn('[BW] Failed to parse balance_update:', e)
        }
      })

      es.addEventListener('error', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data)
          console.warn('[BW] SSE error event:', data.code, data.message)
        } catch {
          // not a JSON error event, likely a connection error
        }

        es.close()
        eventSourceRef.current = null
        setIsBalanceWatcherFailed(true)
        scheduleReconnect(targetAccount)
      })

      es.onerror = () => {
        es.close()
        eventSourceRef.current = null
        setIsBalanceWatcherFailed(true)
        scheduleReconnect(targetAccount)
      }
    },
    [writeBalances, setIsBalanceWatcherFailed, setBalances, scheduleReconnect],
  )

  // Keep the ref in sync
  connectSseRef.current = connectSse

  // Main effect: connect when account/chainId change
  useEffect(() => {
    if (!account) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
      return
    }

    // Reset state for new connection
    reconnectAttemptRef.current = 0
    accumulatedBalancesRef.current = {}
    setBalances((state) => ({ ...state, isLoading: true, chainId }))

    connectSse(account)

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current)
        reconnectTimerRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, chainId])

  // Update session when token lists or custom tokens change
  useEffect(() => {
    if (!account || !eventSourceRef.current) return

    updateBwSession(chainId, account, {
      tokensListsUrls: tokenListUrls,
      customTokens: customTokenAddresses,
    }).catch((e) => {
      console.warn('[BW] Failed to update session:', e)
    })
  }, [account, chainId, tokenListUrls, customTokenAddresses])
}
