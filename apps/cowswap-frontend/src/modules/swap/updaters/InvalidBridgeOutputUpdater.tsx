import { useAtomValue } from 'jotai'
import { useEffect, useMemo } from 'react'

import { getCurrencyAddress, getWrappedToken, isSupportedChainId } from '@cowprotocol/common-utils'
import { BuyTokensParams } from '@cowprotocol/sdk-bridging'

import { useBridgeSupportedTokens } from 'entities/bridgeProvider'

import { useDerivedTradeState } from 'modules/trade'

import { getInvalidBridgeOutputPatch } from './InvalidBridgeOutputUpdater.utils'

import { useUpdateSwapRawState } from '../hooks/useUpdateSwapRawState'
import { swapRawStateAtom } from '../state/swapRawStateAtom'

export function InvalidBridgeOutputUpdater(): null {
  const rawState = useAtomValue(swapRawStateAtom)
  const updateSwapState = useUpdateSwapRawState()
  const { inputCurrency } = useDerivedTradeState() || {}

  const rawChainId = rawState.chainId ?? undefined
  const rawTargetChainId = rawState.targetChainId ?? undefined
  const sourceChainId = isSupportedChainId(rawChainId) ? rawChainId : undefined
  const targetChainId = isSupportedChainId(rawTargetChainId) ? rawTargetChainId : undefined

  // Bridge SDK optionally filters by sellTokenAddress; for native sells we pass the wrapped-native address.
  const sellTokenAddress = inputCurrency ? getCurrencyAddress(getWrappedToken(inputCurrency)) : undefined

  const bridgeRouteParams: BuyTokensParams | undefined = useMemo(() => {
    if (!sourceChainId || !targetChainId || sourceChainId === targetChainId) {
      return undefined
    }

    return {
      sellChainId: sourceChainId,
      buyChainId: targetChainId,
      sellTokenAddress,
    }
  }, [sourceChainId, targetChainId, sellTokenAddress])

  const { data: bridgeRouteData, isLoading: isBridgeRouteLoading } = useBridgeSupportedTokens(bridgeRouteParams)

  const patch = useMemo(
    () =>
      getInvalidBridgeOutputPatch({
        sourceChainId,
        targetChainId,
        selectedOutputCurrencyId: rawState.outputCurrencyId,
        bridgeRouteData,
        isBridgeRouteLoading,
      }),
    [sourceChainId, targetChainId, rawState.outputCurrencyId, bridgeRouteData, isBridgeRouteLoading],
  )

  useEffect(() => {
    if (!patch) return

    updateSwapState(patch)
  }, [patch, updateSwapState])

  return null
}
