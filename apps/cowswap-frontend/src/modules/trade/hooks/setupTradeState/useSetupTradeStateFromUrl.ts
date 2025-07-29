import { useSetAtom } from 'jotai'
import { useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { doesTokenMatchSymbolOrAddress } from '@cowprotocol/common-utils'
import { useSearchToken } from '@cowprotocol/tokens'

import { useLocation, useParams } from 'react-router'

import { tradeStateFromUrlAtom } from '../../state/tradeStateFromUrlAtom'
import { TradeRawState } from '../../types/TradeRawState'

const getChainId = (chainId: string | undefined | null): number | null => {
  if (!chainId) return null
  if (/^\d+$/.test(chainId)) return Number(chainId)
  return null
}

const getToken = (
  currencyId: string | null,
  activeListsResult: TokenWithLogo[],
  inactiveListsResult: TokenWithLogo[],
): TokenWithLogo | undefined => {
  if (!currencyId) return undefined

  return (
    activeListsResult.find((token: TokenWithLogo) => doesTokenMatchSymbolOrAddress(token, currencyId)) ||
    inactiveListsResult.find((token: TokenWithLogo) => doesTokenMatchSymbolOrAddress(token, currencyId))
  )
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

  const stringifiedParams = JSON.stringify(params)

  const { chainId, inputCurrencyId, outputCurrencyId, recipient, recipientAddress, targetChainId } = useMemo(() => {
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

  const isSameChain = targetChainId ? chainId === targetChainId : true
  const { activeListsResult, inactiveListsResult } = useSearchToken(inputCurrencyId || '')

  const inputToken = useMemo(
    () => getToken(inputCurrencyId, activeListsResult, inactiveListsResult),
    [activeListsResult, inactiveListsResult, inputCurrencyId],
  )

  const outputToken = useMemo(
    () => getToken(outputCurrencyId, activeListsResult, inactiveListsResult),
    [activeListsResult, inactiveListsResult, outputCurrencyId],
  )

  const derivedInputCurrencyId = useMemo(() => {
    if (!inputToken && !inputCurrencyId) return null

    if (isSameChain) {
      if (inputToken && outputToken) {
        return inputToken.address
      }
    }

    return inputCurrencyId
  }, [inputToken, outputToken, inputCurrencyId, isSameChain])

  const derivedOutputCurrencyId = useMemo(() => {
    if (!outputToken && !outputCurrencyId) return null

    if (isSameChain) {
      if (outputToken && inputToken) {
        return outputToken.address
      }
    }

    return outputCurrencyId
  }, [outputToken, inputToken, outputCurrencyId, isSameChain])

  /**
   * useEffect() runs after the render completes and useMemo() runs during rendering.
   * In order to update tradeStateFromUrlAtom faster we use useMemo() here.
   * We need this, because useSetupTradeState() depends on the atom value and needs it to be udpated ASAP.
   */
  useMemo(() => {
    const state: TradeRawState = {
      chainId,
      targetChainId,
      inputCurrencyId: derivedInputCurrencyId,
      outputCurrencyId: derivedOutputCurrencyId,
      ...(recipient ? { recipient } : undefined),
      ...(recipientAddress ? { recipientAddress } : undefined),
    }

    setState(state)
  }, [chainId, recipient, recipientAddress, setState, targetChainId, derivedInputCurrencyId, derivedOutputCurrencyId])

  return null
}
