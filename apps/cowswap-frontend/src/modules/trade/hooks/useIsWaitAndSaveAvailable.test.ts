import { renderHook } from '@testing-library/react'

import { useIsProviderNetworkDeprecated } from 'common/hooks/useIsProviderNetworkDeprecated'

import { useIsCurrentTradeBridging } from './useIsCurrentTradeBridging'
import { useIsWaitAndSaveAvailable } from './useIsWaitAndSaveAvailable'

jest.mock('@cowprotocol/common-hooks', () => ({ useFeatureFlags: () => ({ isWaitForCowsEnabled: true }) }))
jest.mock('@cowprotocol/wallet', () => ({ useWalletInfo: () => ({ chainId: 59144 }) }))
jest.mock('entities/injectedWidget', () => ({ useInjectedWidgetParams: () => ({}) }))
jest.mock('common/hooks/useIsProviderNetworkDeprecated', () => ({ useIsProviderNetworkDeprecated: jest.fn() }))
jest.mock('./useIsCurrentTradeBridging', () => ({ useIsCurrentTradeBridging: jest.fn() }))

const mockUseIsProviderNetworkDeprecated = useIsProviderNetworkDeprecated as jest.MockedFunction<
  typeof useIsProviderNetworkDeprecated
>
const mockUseIsCurrentTradeBridging = useIsCurrentTradeBridging as jest.MockedFunction<typeof useIsCurrentTradeBridging>

describe('useIsWaitAndSaveAvailable', () => {
  beforeEach(() => {
    mockUseIsCurrentTradeBridging.mockReturnValue(false)
  })

  it('is available on an active network', () => {
    mockUseIsProviderNetworkDeprecated.mockReturnValue(false)

    expect(renderHook(() => useIsWaitAndSaveAvailable()).result.current).toBe(true)
  })

  it('is not available on a deprecated network', () => {
    mockUseIsProviderNetworkDeprecated.mockReturnValue(true)

    expect(renderHook(() => useIsWaitAndSaveAvailable()).result.current).toBe(false)
  })

  it('is not available for a bridge order', () => {
    mockUseIsProviderNetworkDeprecated.mockReturnValue(false)
    mockUseIsCurrentTradeBridging.mockReturnValue(true)

    expect(renderHook(() => useIsWaitAndSaveAvailable()).result.current).toBe(false)
  })
})
