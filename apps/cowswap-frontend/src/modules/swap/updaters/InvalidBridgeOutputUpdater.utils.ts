import { isAddress } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { BridgeSupportedToken } from 'entities/bridgeProvider'

import { SwapRawState } from '../state/swapRawStateAtom'

export interface InvalidBridgeOutputPatchParams {
  sourceChainId: SupportedChainId | undefined
  targetChainId: SupportedChainId | undefined
  selectedOutputCurrencyId: string | null
  bridgeRouteData: BridgeSupportedToken | null | undefined
  isBridgeRouteLoading: boolean
}

export function getInvalidBridgeOutputPatch(params: InvalidBridgeOutputPatchParams): Partial<SwapRawState> | null {
  const { sourceChainId, targetChainId, selectedOutputCurrencyId, bridgeRouteData, isBridgeRouteLoading } = params

  if (!sourceChainId || !targetChainId || sourceChainId === targetChainId) {
    return null
  }

  // Keep existing state while route availability is still loading or unresolved.
  if (isBridgeRouteLoading || !bridgeRouteData) {
    return null
  }

  // If route is unavailable for the current sell token and destination, reset bridge output entirely.
  if (bridgeRouteData.isRouteAvailable === false) {
    return {
      targetChainId: null,
      outputCurrencyId: null,
      outputCurrencyAmount: null,
    }
  }

  // Route exists, but the currently selected buy token might not be bridgeable for this sell token.
  // In that case, clear only the buy token so the user can re-pick on the same destination chain.
  if (selectedOutputCurrencyId && isAddress(selectedOutputCurrencyId)) {
    const isSelectedOutputSupported = bridgeRouteData.tokens.some(
      (token) => token.address.toLowerCase() === selectedOutputCurrencyId.toLowerCase(),
    )

    if (!isSelectedOutputSupported) {
      return {
        outputCurrencyId: null,
        outputCurrencyAmount: null,
      }
    }
  }

  return null
}
