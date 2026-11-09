import { useFeatureFlags } from '@cowprotocol/common-hooks'

import { renderHook } from '@testing-library/react'
import { useInjectedWidgetParams } from 'entities/injectedWidget'

import { useIsAlternativeOrderModalVisible } from 'modules/trade'

import { Routes } from 'common/constants/routes'
import { useIsProviderNetworkDeprecated } from 'common/hooks/useIsProviderNetworkDeprecated'
import { TradeType, useTradeTypeInfoFromUrl } from 'common/modules/tradeNavigation'

import { usePriceChartVisibility } from './usePriceChartVisibility'

jest.mock('@cowprotocol/common-hooks', () => ({
  useFeatureFlags: jest.fn(),
  useMediaQuery: () => true,
}))
jest.mock('entities/injectedWidget', () => ({ useInjectedWidgetParams: jest.fn() }))
jest.mock('modules/trade', () => ({ useIsAlternativeOrderModalVisible: jest.fn() }))
jest.mock('common/hooks/useIsProviderNetworkUnsupported', () => ({ useIsProviderNetworkUnsupported: () => false }))
jest.mock('common/hooks/useIsProviderNetworkDeprecated', () => ({ useIsProviderNetworkDeprecated: jest.fn() }))
jest.mock('common/modules/tradeNavigation', () => ({
  ...jest.requireActual('common/modules/tradeNavigation/consts'),
  useTradeTypeInfoFromUrl: jest.fn(),
}))
jest.mock('../state/priceChartVisibleAtom', () => ({ priceChartVisibleAtom: jest.requireActual('jotai').atom(true) }))

const mockUseFeatureFlags = useFeatureFlags as jest.MockedFunction<typeof useFeatureFlags>
const mockUseInjectedWidgetParams = useInjectedWidgetParams as jest.MockedFunction<typeof useInjectedWidgetParams>
const mockUseIsAlternativeOrderModalVisible = useIsAlternativeOrderModalVisible as jest.MockedFunction<
  typeof useIsAlternativeOrderModalVisible
>
const mockUseTradeTypeInfoFromUrl = useTradeTypeInfoFromUrl as jest.MockedFunction<typeof useTradeTypeInfoFromUrl>
const mockUseIsProviderNetworkDeprecated = useIsProviderNetworkDeprecated as jest.MockedFunction<
  typeof useIsProviderNetworkDeprecated
>

describe('usePriceChartVisibility', () => {
  beforeEach(() => {
    mockUseFeatureFlags.mockReturnValue({ isPriceChartEnabled: true })
    mockUseInjectedWidgetParams.mockReturnValue({})
    mockUseIsAlternativeOrderModalVisible.mockReturnValue(false)
    mockUseIsProviderNetworkDeprecated.mockReturnValue(false)
    mockUseTradeTypeInfoFromUrl.mockReturnValue({ tradeType: TradeType.LIMIT_ORDER, route: Routes.LIMIT_ORDERS })
  })

  it('shows the chart on an active network', () => {
    const { result } = renderHook(() => usePriceChartVisibility())

    expect(result.current).toBe(true)
  })

  it('hides the chart on a deprecated network', () => {
    mockUseIsProviderNetworkDeprecated.mockReturnValue(true)

    const { result } = renderHook(() => usePriceChartVisibility())

    expect(result.current).toBe(false)
  })

  it('hides the chart when the price chart flag is off', () => {
    mockUseFeatureFlags.mockReturnValue({ isPriceChartEnabled: false })

    const { result } = renderHook(() => usePriceChartVisibility())

    expect(result.current).toBe(false)
  })

  it('hides the chart when the widget disables it', () => {
    mockUseInjectedWidgetParams.mockReturnValue({ disablePriceChart: true })

    const { result } = renderHook(() => usePriceChartVisibility())

    expect(result.current).toBe(false)
  })

  it('hides the chart while the Edit/Recreate order modal is open', () => {
    mockUseIsAlternativeOrderModalVisible.mockReturnValue(true)

    const { result } = renderHook(() => usePriceChartVisibility())

    expect(result.current).toBe(false)
  })

  it('keeps the chart on other trade types while the Edit/Recreate order state is set', () => {
    mockUseIsAlternativeOrderModalVisible.mockReturnValue(true)
    mockUseTradeTypeInfoFromUrl.mockReturnValue({ tradeType: TradeType.SWAP, route: Routes.SWAP })

    const { result } = renderHook(() => usePriceChartVisibility())

    expect(result.current).toBe(true)
  })
})
