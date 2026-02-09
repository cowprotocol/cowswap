import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { getInvalidBridgeOutputPatch } from './InvalidBridgeOutputUpdater.utils'

describe('getInvalidBridgeOutputPatch', () => {
  it('returns null when route check is still loading', () => {
    const result = getInvalidBridgeOutputPatch({
      sourceChainId: SupportedChainId.LINEA,
      targetChainId: SupportedChainId.MAINNET,
      selectedOutputCurrencyId: '0x0000000000000000000000000000000000000001',
      bridgeRouteData: undefined,
      isBridgeRouteLoading: true,
    })

    expect(result).toBeNull()
  })

  it('clears output when route is available but selected output is not supported', () => {
    const result = getInvalidBridgeOutputPatch({
      sourceChainId: SupportedChainId.LINEA,
      targetChainId: SupportedChainId.MAINNET,
      selectedOutputCurrencyId: '0x0000000000000000000000000000000000000001',
      bridgeRouteData: {
        isRouteAvailable: true,
        tokens: [{ address: '0x00000000000000000000000000000000000000aa' }] as never,
      },
      isBridgeRouteLoading: false,
    })

    expect(result).toEqual({
      outputCurrencyId: null,
      outputCurrencyAmount: null,
    })
  })

  it('returns reset patch when route is unavailable for active bridge pair', () => {
    const result = getInvalidBridgeOutputPatch({
      sourceChainId: SupportedChainId.LINEA,
      targetChainId: SupportedChainId.MAINNET,
      selectedOutputCurrencyId: '0x0000000000000000000000000000000000000001',
      bridgeRouteData: { tokens: [], isRouteAvailable: false },
      isBridgeRouteLoading: false,
    })

    expect(result).toEqual({
      targetChainId: null,
      outputCurrencyId: null,
      outputCurrencyAmount: null,
    })
  })

  it('returns null when selected output token is supported for the route', () => {
    const result = getInvalidBridgeOutputPatch({
      sourceChainId: SupportedChainId.LINEA,
      targetChainId: SupportedChainId.MAINNET,
      selectedOutputCurrencyId: '0x00000000000000000000000000000000000000aa',
      bridgeRouteData: {
        isRouteAvailable: true,
        tokens: [{ address: '0x00000000000000000000000000000000000000aa' }] as never,
      },
      isBridgeRouteLoading: false,
    })

    expect(result).toBeNull()
  })

  it('returns null when source and target are equal', () => {
    const result = getInvalidBridgeOutputPatch({
      sourceChainId: SupportedChainId.LINEA,
      targetChainId: SupportedChainId.LINEA,
      selectedOutputCurrencyId: '0x0000000000000000000000000000000000000001',
      bridgeRouteData: { tokens: [], isRouteAvailable: false },
      isBridgeRouteLoading: false,
    })

    expect(result).toBeNull()
  })
})
