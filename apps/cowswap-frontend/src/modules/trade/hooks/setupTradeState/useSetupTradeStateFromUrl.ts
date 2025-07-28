import { useSetAtom } from 'jotai'
import { useMemo } from 'react'

import { useSearchToken } from '@cowprotocol/tokens'

import { useLocation, useParams } from 'react-router'

import { tradeStateFromUrlAtom } from '../../state/tradeStateFromUrlAtom'
import { TradeRawState } from '../../types/TradeRawState'

const getMaybeChainId = (chainId: string | undefined | null): number | null => {
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
  const setState = useSetAtom(tradeStateFromUrlAtom)

  const { chainId, inputCurrencyId, outputCurrencyId, recipient, recipientAddress, targetChainId } = useMemo(() => {
    const stringifiedParams = JSON.stringify(params)
    const searchParams = new URLSearchParams(location.search)
    const targetChainId = searchParams.get('targetChainId')
    const recipient = searchParams.get('recipient')
    const recipientAddress = searchParams.get('recipientAddress')
    const { chainId, inputCurrencyId, outputCurrencyId } = JSON.parse(stringifiedParams)

    console.log('inputCurrencyId ==>', inputCurrencyId)

    return {
      chainId: getMaybeChainId(chainId),
      inputCurrencyId: inputCurrencyId ?? null,
      outputCurrencyId: outputCurrencyId ?? null,
      recipient,
      recipientAddress,
      targetChainId: getMaybeChainId(targetChainId),
    }
  }, [location.search, params])

  const { activeListsResult, inactiveListsResult } = useSearchToken(inputCurrencyId || '')

  const inputToken = useMemo(() => {
    if (!inputCurrencyId) return null

    return (
      activeListsResult.find((token) => token.symbol === inputCurrencyId) ||
      inactiveListsResult.find((token) => token.symbol === inputCurrencyId)
    )
  }, [activeListsResult, inactiveListsResult, inputCurrencyId])

  /**
   * useEffect() runs after the render completes and useMemo() runs during rendering.
   * In order to update tradeStateFromUrlAtom faster we use useMemo() here.
   * We need this, because useSetupTradeState() depends on the atom value and needs it to be udpated ASAP.
   */
  useMemo(() => {
    const isSameChain = targetChainId ? chainId === targetChainId : true

    const derivedInputCurrencyId = isSameChain ? inputToken?.address.toLowerCase() : inputCurrencyId?.toLowerCase()

    console.log('isSameChain ==>', isSameChain, chainId, targetChainId)
    console.log('derivedInputCurrencyId ==>', derivedInputCurrencyId, inputToken?.address, inputCurrencyId)

    const state: TradeRawState = {
      chainId,
      targetChainId,
      inputCurrencyId: derivedInputCurrencyId,
      outputCurrencyId,
      ...(recipient ? { recipient } : undefined),
      ...(recipientAddress ? { recipientAddress } : undefined),
    }

    setState(state)
  }, [chainId, inputToken, inputCurrencyId, outputCurrencyId, recipient, recipientAddress, setState, targetChainId])

  return null
}
