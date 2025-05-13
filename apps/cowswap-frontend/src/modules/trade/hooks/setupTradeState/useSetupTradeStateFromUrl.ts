import { useSetAtom } from 'jotai'
import { useMemo, useRef } from 'react'

import { useLocation, useParams } from 'react-router'

import { tradeStateFromUrlAtom } from '../../state/tradeStateFromUrlAtom'
import { TradeRawState } from '../../types/TradeRawState'
import { useTradeState } from '../useTradeState'

/**
 * Updater to fetch trade state from URL params and query, and store it on jotai state
 * /1/swap/WETH/DAI?recipient=0x -> { chainId: 1, inputCurrencyId: 'WETH', outputCurrencyId: 'DAI', recipient: '0x' }
 *
 * Load this hook only once to avoid unnecessary re-renders
 */
export function useSetupTradeStateFromUrl(): null {
  const params = useParams()
  const location = useLocation()
  const stringifiedParams = JSON.stringify(params)
  const setState = useSetAtom(tradeStateFromUrlAtom)
  const { state } = useTradeState()
  const tradeStateRef = useRef(state)
  tradeStateRef.current = state

  /**
   * useEffect() runs after the render completes and useMemo() runs during rendering.
   * In order to update tradeStateFromUrlAtom faster we use useMemo() here.
   * We need this, because useSetupTradeState() depends on the atom value and needs it to be udpated ASAP.
   */
  useMemo(() => {
    const searchParams = new URLSearchParams(location.search)
    const targetChainId = searchParams.get('targetChainId')
    const recipient = searchParams.get('recipient')
    const recipientAddress = searchParams.get('recipientAddress')
    const { chainId, inputCurrencyId, outputCurrencyId } = JSON.parse(stringifiedParams)
    const chainIdAsNumber = chainId && /^\d+$/.test(chainId) ? parseInt(chainId) : null

    const state: TradeRawState = {
      chainId: chainIdAsNumber,
      targetChainId: targetChainId ? +targetChainId : null,
      inputCurrencyId: inputCurrencyId || searchParams.get('inputCurrency') || null,
      outputCurrencyId: outputCurrencyId || searchParams.get('outputCurrency') || null,
      ...(recipient ? { recipient } : undefined),
      ...(recipientAddress ? { recipientAddress } : undefined),
    }

    setState(state)
  }, [location.search, stringifiedParams, setState])

  return null
}
