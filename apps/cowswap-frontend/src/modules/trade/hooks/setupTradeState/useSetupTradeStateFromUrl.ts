import { useSetAtom } from 'jotai'
import { useMemo } from 'react'

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
      chainId: getChainId(chainId),
      inputCurrencyId: inputCurrencyId ?? null,
      outputCurrencyId: outputCurrencyId ?? null,
      recipient,
      recipientAddress,
      targetChainId: getChainId(targetChainId),
    }
  }, [location.search, stringifiedParams])

  /**
   * useEffect() runs after the render completes and useMemo() runs during rendering.
   * In order to update tradeStateFromUrlAtom faster we use useMemo() here.
   * We need this, because useSetupTradeState() depends on the atom value and needs it to be udpated ASAP.
   */
  useMemo(() => {
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
