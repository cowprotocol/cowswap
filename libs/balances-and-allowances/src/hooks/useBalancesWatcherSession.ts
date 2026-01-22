import { useCallback, useState } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { createSession, SessionTokensPayload, updateSession } from '../services/balancesWatcherApi'

export interface UseBalancesWatcherSessionResult {
  /**
   * Creates a new session. Must be called before SSE connection.
   */
  create: (payload: SessionTokensPayload) => Promise<void>

  /**
   * Updates existing session to add more tokens.
   * Can be called while SSE connection is active.
   */
  update: (payload: SessionTokensPayload) => Promise<void>

  /**
   * Whether a session has been created
   */
  hasSession: boolean
}

/**
 * Hook to manage balances watcher session lifecycle.
 * Provides methods to create and update sessions.
 */
export function useBalancesWatcherSession(
  chainId: SupportedChainId,
  account: string | undefined,
): UseBalancesWatcherSessionResult {
  const [hasSession, setHasSession] = useState(false)

  const create = useCallback(
    async (payload: SessionTokensPayload): Promise<void> => {
      if (!account) {
        throw new Error('Cannot create session without account')
      }

      await createSession(chainId, account, payload)
      setHasSession(true)
    },
    [chainId, account],
  )

  const update = useCallback(
    async (payload: SessionTokensPayload): Promise<void> => {
      if (!account) {
        throw new Error('Cannot update session without account')
      }

      if (!hasSession) {
        // If no session exists, create one instead
        await createSession(chainId, account, payload)
        setHasSession(true)
      } else {
        await updateSession(chainId, account, payload)
      }
    },
    [chainId, account, hasSession],
  )

  return {
    create,
    update,
    hasSession,
  }
}
