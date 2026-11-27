import { USDC_MAINNET } from '@cowprotocol/common-const'
import { OrderKind } from '@cowprotocol/cow-sdk'

import { renderHook } from '@testing-library/react'

import { useIsProviderNetworkDeprecated } from 'common/hooks/useIsProviderNetworkDeprecated'

import { useLimitOrdersDerivedStateToFill } from './useLimitOrdersDerivedState'

import { DEFAULT_LIMIT_DERIVED_STATE } from '../state/limitOrdersRawStateAtom'

const mockDerivedState = { inputCurrency: USDC_MAINNET, orderKind: OrderKind.SELL }

jest.mock('modules/trade/hooks/useBuildTradeDerivedState', () => ({
  useBuildTradeDerivedState: () => mockDerivedState,
}))
jest.mock('./useIsWidgetUnlocked', () => ({ useIsWidgetUnlocked: () => true }))
jest.mock('common/hooks/useIsProviderNetworkUnsupported', () => ({ useIsProviderNetworkUnsupported: () => false }))
jest.mock('common/hooks/useIsProviderNetworkDeprecated', () => ({ useIsProviderNetworkDeprecated: jest.fn() }))

const mockUseIsProviderNetworkDeprecated = useIsProviderNetworkDeprecated as jest.MockedFunction<
  typeof useIsProviderNetworkDeprecated
>

describe('useLimitOrdersDerivedStateToFill', () => {
  it('keeps the form state on an active network', () => {
    mockUseIsProviderNetworkDeprecated.mockReturnValue(false)

    const { result } = renderHook(() => useLimitOrdersDerivedStateToFill())

    expect(result.current.inputCurrency).toBe(USDC_MAINNET)
  })

  it('clears the form state on a deprecated network', () => {
    mockUseIsProviderNetworkDeprecated.mockReturnValue(true)

    const { result } = renderHook(() => useLimitOrdersDerivedStateToFill())

    expect(result.current).toBe(DEFAULT_LIMIT_DERIVED_STATE)
  })
})
