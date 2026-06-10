import { useSetAtom } from 'jotai'
import { useEffect, useRef } from 'react'

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
 * Owns the (POST session → open SSE) lifecycle for the balances watcher and
 * writes incoming balance updates into `balancesAtom`. Replaces the multicall
 * pipeline when the `useBalancesWatcher` LD flag is on.
 *
 * Lifecycle: a new session is created whenever account, chainId, or the set of
 * lists/custom tokens changes. The previous EventSource is closed and any
 * in-flight POST is invalidated via an epoch ref (the transport's
 * `fetchWithTimeout` does not honor an external signal — adding signal support
 * is a follow-up for the hardening PR).
 */
export function useBalancesWatcherSession(params: UseBalancesWatcherSessionParams): void {
  const { account, chainId, tokensListsUrls, customTokens } = params

  const setBalances = useSetAtom(balancesAtom)
  const epochRef = useRef(0)

  // The `tokensListsUrls` and `customTokens` arrays are expected to be
  // referentially stable across renders (callers memoize them). The session is
  // re-created whenever any of the deps below change identity.
  useEffect(() => {
    if (!account) return
    if (!isEvmChain(chainId)) return
    // Server rejects (400) when both arrays are empty — skip session creation
    // until the user enables a list or imports a token.
    if (tokensListsUrls.length === 0 && customTokens.length === 0) return

    const epoch = ++epochRef.current
    let subscription: BalancesSubscription | undefined
    let isFirstEvent = true

    setBalances((state) => ({ ...state, isLoading: true, chainId, error: null }))

    createBalancesWatcherSession({
      chainId,
      owner: account,
      body: { tokensListsUrls, customTokens },
    })
      .then(() => {
        if (epoch !== epochRef.current) return

        subscription = subscribeToBalancesEvents({
          chainId,
          owner: account,
          onBalances: (balances) => {
            if (epoch !== epochRef.current) return
            setBalances((state) => writeBalancesUpdate(state, balances, chainId, isFirstEvent))
            isFirstEvent = false
          },
          onError: (error, terminal) => {
            if (epoch !== epochRef.current) return
            // Non-terminal errors mean EventSource is reconnecting — the
            // transport recovers on its own. Only surface terminal errors.
            if (!terminal) return
            setBalances((state) => ({ ...state, error: error.message, isLoading: false }))
          },
        })
      })
      .catch((error: unknown) => {
        if (epoch !== epochRef.current) return
        const message = error instanceof Error ? error.message : String(error)
        setBalances((state) => ({ ...state, error: message, isLoading: false }))
      })

    return () => {
      // Bumping the epoch invalidates any pending `.then` / SSE callback that
      // resolves after teardown — `epoch` (captured) will no longer match
      // `epochRef.current`. Mutation in the cleanup is intentional here.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      epochRef.current++
      subscription?.close()
    }
  }, [account, chainId, tokensListsUrls, customTokens, setBalances])
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
