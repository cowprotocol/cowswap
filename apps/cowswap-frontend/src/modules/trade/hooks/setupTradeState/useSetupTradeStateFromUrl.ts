import { useSetAtom } from 'jotai'
import { useLayoutEffect, useMemo } from 'react'

import { useLocation, useParams } from 'react-router'

import { tradeStateFromUrlAtom } from '../../state/tradeStateFromUrlAtom'
import { TradeRawState } from '../../types/TradeRawState'

const getChainId = (chainId: string | undefined | null): number | null => {
  if (!chainId) return null
  if (/^\d+$/.test(chainId)) return Number(chainId)
  return null
}

/**
 * Updater to fetch trade state from URL params and query, and store it on jotai state
 * /1/swap/WETH/DAI?recipient=0x -> { chainId: 1, inputCurrencyId: 'WETH', outputCurrencyId: 'DAI', recipient: '0x' }
 *
 * Load this hook only once to avoid unnecessary re-renders
 *
 * Returns the freshly computed state too (not just via the atom): `useSetupTradeState` needs it
 * synchronously within this same render (its own call to `useTradeStateFromUrl()` would otherwise
 * see last render's atom value, since the atom is only updated in a `useLayoutEffect` below — see
 * that effect's own comment for why it isn't updated during render instead).
 */
export function useSetupTradeStateFromUrl(): TradeRawState {
  const params = useParams()
  const location = useLocation()
  const stringifiedParams = JSON.stringify(params)
  const setState = useSetAtom(tradeStateFromUrlAtom)

  const state = useMemo<TradeRawState>(() => {
    const searchParams = new URLSearchParams(location.search)
    const targetChainId = searchParams.get('targetChainId')
    const recipient = searchParams.get('recipient')
    const { chainId, inputCurrencyId, outputCurrencyId } = JSON.parse(stringifiedParams)

    return {
      chainId: getChainId(chainId),
      inputCurrencyId: inputCurrencyId ?? null,
      outputCurrencyId: outputCurrencyId ?? null,
      targetChainId: getChainId(targetChainId),
      ...(recipient ? { recipient } : undefined),
    }
  }, [location.search, stringifiedParams])

  /**
   * `useLayoutEffect` runs synchronously after render but before paint — this still propagates to
   * other consumers of `tradeStateFromUrlAtom` (`useResetRecipient`, `useWithRecipient`) before the
   * browser paints, but — unlike the render-phase `useMemo` this replaced — doesn't risk updating
   * an already-rendered sibling/parent subscriber (e.g. `TradeWidgetUpdaters`, which reads this
   * atom via `useResetRecipient`) while this component is still mid-render, which React flags as
   * "Cannot update a component while rendering a different component" and can silently drop the
   * update. See `HydrateAtom`'s and `useSetupTradeTypeInfo`'s identical fix/reasoning.
   */
  useLayoutEffect(() => {
    setState(state)
  }, [state, setState])

  return state
}
