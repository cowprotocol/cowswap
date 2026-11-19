import { useAtomValue } from 'jotai'
import { loadable } from 'jotai/utils'
import { useEffect, useRef } from 'react'

import type { TargetChainId } from '@cowprotocol/cow-sdk'

import { allActiveTokensAtom } from '../../state/tokens/allTokensAtom'
import { getUnknownPrioritizedTokenKeys } from '../../utils/getPrioritizedTokenKeys'

// ponytail: default lists and customTokens load with no shared "done" flag, so warn only after the active tokens
// are stable for this long (a slower list can cause a stale warning). Integrator tokenLists use the loading flag.
const WARNING_DELAY_MS = 3_000

// Loadable, not useAtomValue: the async atom would suspend the updater, which also blocks its environment effect
const allActiveTokensLoadableAtom = loadable(allActiveTokensAtom)

export function usePrioritizedTokensWarning(
  prioritizedTokens: Partial<Record<TargetChainId, string[]>> | undefined,
  areWidgetListsLoading: boolean,
): void {
  const activeTokensLoadable = useAtomValue(allActiveTokensLoadableAtom)
  const activeTokens = activeTokensLoadable.state === 'hasData' ? activeTokensLoadable.data : undefined
  const loggedWarnings = useRef(new Set<string>())

  useEffect(() => {
    if (!prioritizedTokens || !activeTokens?.tokens.length || areWidgetListsLoading) return

    const { tokens, chainId } = activeTokens

    const timeout = setTimeout(() => {
      const unknownKeys = getUnknownPrioritizedTokenKeys(prioritizedTokens, chainId, tokens)

      if (!unknownKeys.length) return

      const message = `[CoW widget] prioritizedTokens not found on chain ${chainId}: ${unknownKeys.join(', ')}. Add them with customTokens, or check they are on this network.`

      if (loggedWarnings.current.has(message)) return

      loggedWarnings.current.add(message)
      console.warn(message)
    }, WARNING_DELAY_MS)

    return () => clearTimeout(timeout)
  }, [prioritizedTokens, activeTokens, areWidgetListsLoading])
}
