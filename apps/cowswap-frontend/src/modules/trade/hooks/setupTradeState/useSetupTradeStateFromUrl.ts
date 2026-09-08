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

  /**
   * `location.search` also carries params unrelated to trade identity (e.g. `sellAmount`, stripped
   * shortly after load by `useSetupTradeAmountsFromUrl`'s `cleanParams`) — depending on the whole
   * string below would recompute (and return a new object) on every such change too, even though
   * only `targetChainId`/`recipient` actually feed into the result. Extracting exactly those two
   * primitives here, and using them (rather than `location.search` itself) as the memo's deps,
   * keeps the returned reference stable across irrelevant search-param churn. That matters because
   * this hook's caller (`useSetupTradeState`)'s "on URL parameter changes" effect keys off this
   * return value — a spurious new reference there re-applies an unchanged trade state, resetting
   * and restarting derived-state consumers (e.g. the trade quote) for no reason, observed as
   * CS-287's flaky multi-second `waitForQuote()` hang.
   */
  const searchParams = new URLSearchParams(location.search)
  const targetChainIdParam = searchParams.get('targetChainId')
  const recipientParam = searchParams.get('recipient')

  const state = useMemo<TradeRawState>(() => {
    const { chainId, inputCurrencyId, outputCurrencyId } = JSON.parse(stringifiedParams)

    return {
      chainId: getChainId(chainId),
      inputCurrencyId: inputCurrencyId ?? null,
      outputCurrencyId: outputCurrencyId ?? null,
      targetChainId: getChainId(targetChainIdParam),
      ...(recipientParam ? { recipient: recipientParam } : undefined),
    }
  }, [stringifiedParams, targetChainIdParam, recipientParam])

  /**
   * `useLayoutEffect` runs synchronously after render but before paint — this still propagates to
   * other consumers of `tradeStateFromUrlAtom` (`useResetRecipient`, `useWithRecipient`) before the
   * browser paints, but — unlike a render-phase `useMemo`/`setState` call — doesn't risk updating
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
