import { useSetAtom } from 'jotai'
import { tradeStateFromUrlAtom } from 'modules/trade/state/tradeStateFromUrlAtom'
import { useEffect } from 'react'

import { useLocation, useParams } from 'react-router-dom'

import { TradeRawState } from '../../types/TradeRawState'

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

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const recipient = searchParams.get('recipient')
    const recipientAddress = searchParams.get('recipientAddress')
    const { chainId, inputCurrencyId, outputCurrencyId } = JSON.parse(stringifiedParams)
    const chainIdAsNumber = chainId && /^\d+$/.test(chainId) ? parseInt(chainId) : null

    const state: TradeRawState = {
      chainId: chainIdAsNumber,
      inputCurrencyId: inputCurrencyId || searchParams.get('inputCurrency') || null,
      outputCurrencyId: outputCurrencyId || searchParams.get('outputCurrency') || null,
      ...(recipient ? { recipient } : undefined),
      ...(recipientAddress ? { recipientAddress } : undefined),
    }
    console.log(`trade state`, location.search, params, state)

    setState(state)

    return () => console.log(`trade state unmounted`)
  }, [location.search, stringifiedParams, setState])

  return null
}
