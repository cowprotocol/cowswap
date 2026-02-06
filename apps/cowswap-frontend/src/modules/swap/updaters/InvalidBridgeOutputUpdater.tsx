import { useAtomValue } from 'jotai'
import { useEffect, useMemo } from 'react'

import { isSupportedChainId } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { BuyTokensParams } from '@cowprotocol/sdk-bridging'

import { BridgeSupportedToken, useBridgeSupportedTokens } from 'entities/bridgeProvider'

import { useUpdateSwapRawState } from '../hooks/useUpdateSwapRawState'
import { SwapRawState, swapRawStateAtom } from '../state/swapRawStateAtom'

interface InvalidBridgeOutputPatchParams {
  sourceChainId: SupportedChainId | undefined
  targetChainId: SupportedChainId | undefined
  bridgeRouteData: BridgeSupportedToken | null | undefined
  isBridgeRouteLoading: boolean
}

export function getInvalidBridgeOutputPatch(params: InvalidBridgeOutputPatchParams): Partial<SwapRawState> | null {
  const { sourceChainId, targetChainId, bridgeRouteData, isBridgeRouteLoading } = params

  if (!sourceChainId || !targetChainId || sourceChainId === targetChainId) {
    return null
  }

  // Keep existing state while route availability is still loading or unresolved.
  if (isBridgeRouteLoading || !bridgeRouteData) {
    return null
  }

  if (bridgeRouteData.isRouteAvailable !== false) {
    return null
  }

  return {
    targetChainId: null,
    outputCurrencyId: null,
    outputCurrencyAmount: null,
  }
}

export function InvalidBridgeOutputUpdater(): null {
  const rawState = useAtomValue(swapRawStateAtom)
  const updateSwapState = useUpdateSwapRawState()

  const rawChainId = rawState.chainId ?? undefined
  const rawTargetChainId = rawState.targetChainId ?? undefined
  const sourceChainId = isSupportedChainId(rawChainId) ? rawChainId : undefined
  const targetChainId = isSupportedChainId(rawTargetChainId) ? rawTargetChainId : undefined

  const bridgeRouteParams: BuyTokensParams | undefined = useMemo(() => {
    if (!sourceChainId || !targetChainId || sourceChainId === targetChainId) {
      return undefined
    }

    return {
      sellChainId: sourceChainId,
      buyChainId: targetChainId,
    }
  }, [sourceChainId, targetChainId])

  const { data: bridgeRouteData, isLoading: isBridgeRouteLoading } = useBridgeSupportedTokens(bridgeRouteParams)

  const patch = useMemo(
    () =>
      getInvalidBridgeOutputPatch({
        sourceChainId,
        targetChainId,
        bridgeRouteData,
        isBridgeRouteLoading,
      }),
    [sourceChainId, targetChainId, bridgeRouteData, isBridgeRouteLoading],
  )

  useEffect(() => {
    if (!patch) return

    updateSwapState(patch)
  }, [patch, updateSwapState])

  return null
}
