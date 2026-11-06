import { renderHook } from '@testing-library/react'

import { useIsProviderNetworkDeprecated } from 'common/hooks/useIsProviderNetworkDeprecated'

import { useIsWaitAndSaveAvailable } from './useIsWaitAndSaveAvailable'

jest.mock('@cowprotocol/common-hooks', () => ({ useFeatureFlags: () => ({ isWaitForCowsEnabled: true }) }))
jest.mock('@cowprotocol/wallet', () => ({ useWalletInfo: () => ({ chainId: 59144 }) }))
jest.mock('entities/injectedWidget', () => ({ useInjectedWidgetParams: () => ({}) }))
jest.mock('common/hooks/useIsProviderNetworkDeprecated', () => ({ useIsProviderNetworkDeprecated: jest.fn() }))

const mockUseIsProviderNetworkDeprecated = useIsProviderNetworkDeprecated as jest.MockedFunction<
  typeof useIsProviderNetworkDeprecated
>

describe('useIsWaitAndSaveAvailable', () => {
  it('is available on an active network', () => {
    mockUseIsProviderNetworkDeprecated.mockReturnValue(false)

    expect(renderHook(() => useIsWaitAndSaveAvailable()).result.current).toBe(true)
  })

  it('is not available on a deprecated network', () => {
    mockUseIsProviderNetworkDeprecated.mockReturnValue(true)

    expect(renderHook(() => useIsWaitAndSaveAvailable()).result.current).toBe(false)
  })
})
