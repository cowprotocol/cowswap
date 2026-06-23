import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { getAddressKey, isEvmChain, SupportedChainId } from '@cowprotocol/cow-sdk'

import {
  type BalancesMap,
  type BalancesSubscription,
  createBalancesWatcherSession,
  subscribeToBalancesEvents,
} from '../balancesWatcher'
import { balancesAtom, BalancesState } from '../state/balancesAtom'

export interface UseBalancesWatcherSessionParams {
  account: string | undefined
  chainId: SupportedChainId
  /**
   * Enabled token list source URLs. Sent verbatim in the session POST.
   */
  tokensListsUrls: string[]
  /**
   * Custom (user-imported) token addresses for the current chain. Sent verbatim
   * in the session POST.
   */
  customTokens: string[]
}

/**
 * Lifecycle: a new session is created whenever account, chainId, or the set of
 * lists/custom tokens changes. The previous EventSource is closed and any
 * in-flight POST is invalidated via an epoch ref (the transport's
 * `fetchWithTimeout` does not honor an external signal — adding signal support
 * is a follow-up for the hardening PR).
 */
export function useBalancesWatcherSession(params: UseBalancesWatcherSessionParams): void {
  const { account, chainId, tokensListsUrls, customTokens } = params

  const setBalances = useSetAtom(balancesAtom)

  useEffect(() => {
    if (!account) return
    if (!isEvmChain(chainId)) return
    if (tokensListsUrls.length === 0 && customTokens.length === 0) {
      // Nothing to subscribe to, but we still must close the first-load gate
      // so form validation does not park the UI in `BalancesLoading` forever
      // (see comment on `applyTerminalError`).
      setBalances((state) => applyEmptyLoad(state, chainId))
      return
    }

    // Each effect run owns its own `cancelled` flag; the cleanup flips this
    // run's flag to true so any later `.then` / SSE callback short-circuits.
    // A newer effect run gets a fresh `cancelled = false` and proceeds.
    let cancelled = false
    let subscription: BalancesSubscription | undefined
    let isFirstEvent = true

    setBalances((state) => ({ ...state, isLoading: true, chainId, error: null }))

    createBalancesWatcherSession({
      chainId,
      owner: account,
      body: { tokensListsUrls, customTokens },
    })
      .then(() => {
        if (cancelled) return

        subscription = subscribeToBalancesEvents({
          chainId,
          owner: account,
          onBalances: (balances) => {
            if (cancelled) return
            setBalances((state) => writeBalancesUpdate(state, balances, chainId, isFirstEvent))
            isFirstEvent = false
          },
          onError: (error, terminal) => {
            if (cancelled) return
            // Non-terminal errors mean EventSource is reconnecting — the
            // transport recovers on its own. Only surface terminal errors.
            if (!terminal) return
            setBalances((state) => applyTerminalError(state, error.message))
          },
        })
      })
      .catch((error: unknown) => {
        if (cancelled) return
        const message = error instanceof Error ? error.message : String(error)
        setBalances((state) => applyTerminalError(state, message))
      })

    return () => {
      cancelled = true
      subscription?.close()
    }
  }, [account, chainId, tokensListsUrls, customTokens, setBalances])
}

/**
 * Mark the first-load gate as concluded (with error). Form-validation reads
 * `!hasFirstLoad` to decide whether to keep the UI in `BalancesLoading` —
 * without setting it on the error path, a watcher failure before the first
 * SSE event would leave the UI stuck on a permanent loading spinner instead
 * of surfacing the error state.
 */
function applyTerminalError(state: BalancesState, message: string): BalancesState {
  return {
    ...state,
    error: message,
    isLoading: false,
    hasFirstLoad: true,
  }
}

function applyEmptyLoad(state: BalancesState, chainId: SupportedChainId): BalancesState {
  return {
    ...state,
    chainId,
    error: null,
    isLoading: false,
    hasFirstLoad: true,
  }
}

function writeBalancesUpdate(
  state: BalancesState,
  payload: BalancesMap,
  chainId: SupportedChainId,
  isFirstEvent: boolean,
): BalancesState {
  const merged: BalancesState['values'] = { ...state.values }
  for (const rawAddress of Object.keys(payload)) {
    const normalizedAddress = getAddressKey(rawAddress)
    merged[normalizedAddress] = BigInt(payload[rawAddress])
  }

  return {
    ...state,
    chainId,
    values: merged,
    ...(isFirstEvent
      ? {
          fromCache: false,
          hasFirstLoad: true,
          error: null,
          isLoading: false,
        }
      : {}),
  }
}
