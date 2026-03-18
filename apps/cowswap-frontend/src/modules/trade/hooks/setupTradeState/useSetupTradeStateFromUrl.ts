import { useSetAtom } from 'jotai'
import { useLayoutEffect, useMemo } from 'react'

import { parseChainIdFromUrlSegment } from '@cowprotocol/common-utils'

import { useLocation, useParams } from 'react-router'

import { tradeStateFromUrlAtom } from '../../state/tradeStateFromUrlAtom'
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

  const { chainId, recipient, recipientAddress, targetChainId, inputCurrencyId, outputCurrencyId } = useMemo(() => {
    const searchParams = new URLSearchParams(location.search)
    const targetChainId = searchParams.get('targetChainId')
    const recipient = searchParams.get('recipient')
    const recipientAddress = searchParams.get('recipientAddress')
    const { chainId, inputCurrencyId, outputCurrencyId } = JSON.parse(stringifiedParams)

    return {
      chainId: parseChainIdFromUrlSegment(chainId),
      inputCurrencyId: inputCurrencyId ?? null,
      outputCurrencyId: outputCurrencyId ?? null,
      recipient,
      recipientAddress,
      targetChainId: parseChainIdFromUrlSegment(targetChainId),
    }
  }, [location.search, stringifiedParams])

  // Update atom in useLayoutEffect so the value is available before paint and before
  // useSetupTradeState's effect runs, without triggering "Cannot update a component while rendering another".
  useLayoutEffect(() => {
    const state: TradeRawState = {
      chainId,
      targetChainId,
      inputCurrencyId,
      outputCurrencyId,
      ...(recipient ? { recipient } : undefined),
      ...(recipientAddress ? { recipientAddress } : undefined),
    }

    setState(state)
  }, [chainId, recipient, recipientAddress, setState, targetChainId, inputCurrencyId, outputCurrencyId])

  return null
}
