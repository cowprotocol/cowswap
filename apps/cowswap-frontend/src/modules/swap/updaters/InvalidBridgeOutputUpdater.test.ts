import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { getInvalidBridgeOutputPatch } from './InvalidBridgeOutputUpdater'

describe('getInvalidBridgeOutputPatch', () => {
  it('returns null when route check is still loading', () => {
    const result = getInvalidBridgeOutputPatch({
      sourceChainId: SupportedChainId.LINEA,
      targetChainId: SupportedChainId.MAINNET,
      bridgeRouteData: undefined,
      isBridgeRouteLoading: true,
    })

    expect(result).toBeNull()
  })

  it('returns null when route is available', () => {
    const result = getInvalidBridgeOutputPatch({
      sourceChainId: SupportedChainId.LINEA,
      targetChainId: SupportedChainId.MAINNET,
      bridgeRouteData: { tokens: [], isRouteAvailable: true },
      isBridgeRouteLoading: false,
    })

    expect(result).toBeNull()
  })

  it('returns reset patch when route is unavailable for active bridge pair', () => {
    const result = getInvalidBridgeOutputPatch({
      sourceChainId: SupportedChainId.LINEA,
      targetChainId: SupportedChainId.MAINNET,
      bridgeRouteData: { tokens: [], isRouteAvailable: false },
      isBridgeRouteLoading: false,
    })

    expect(result).toEqual({
      targetChainId: null,
      outputCurrencyId: null,
      outputCurrencyAmount: null,
    })
  })

  it('returns null when source and target are equal', () => {
    const result = getInvalidBridgeOutputPatch({
      sourceChainId: SupportedChainId.LINEA,
      targetChainId: SupportedChainId.LINEA,
      bridgeRouteData: { tokens: [], isRouteAvailable: false },
      isBridgeRouteLoading: false,
    })

    expect(result).toBeNull()
  })
})
