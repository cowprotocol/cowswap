import { useFeatureFlags, useSetIsBridgingEnabled } from '@cowprotocol/common-hooks'
import { isInjectedWidget } from '@cowprotocol/common-utils'
import { useIsSafeApp } from '@cowprotocol/wallet'

import { render } from '@testing-library/react'
import { useHasBridgeProviders } from 'entities/bridgeProvider'
import { useInjectedWidgetParams } from 'entities/injectedWidget'

import { useTradeTypeInfo } from 'modules/trade'

import { Routes } from 'common/constants/routes'

import { BridgingEnabledUpdater } from './BridgingEnabledUpdater'

jest.mock('@cowprotocol/common-hooks', () => ({
  useFeatureFlags: jest.fn(),
  useSetIsBridgingEnabled: jest.fn(),
}))

jest.mock('@cowprotocol/common-utils', () => ({
  isInjectedWidget: jest.fn(),
}))

jest.mock('@cowprotocol/wallet', () => ({
  useIsSafeApp: jest.fn(),
}))

jest.mock('entities/bridgeProvider', () => ({
  useHasBridgeProviders: jest.fn(),
}))

jest.mock('entities/injectedWidget', () => ({
  useInjectedWidgetParams: jest.fn(),
}))

jest.mock('modules/trade', () => ({
  useTradeTypeInfo: jest.fn(),
}))

const setIsBridgingEnabledMock = jest.fn()

const useFeatureFlagsMock = useFeatureFlags as jest.Mock
const useSetIsBridgingEnabledMock = useSetIsBridgingEnabled as jest.Mock
const isInjectedWidgetMock = isInjectedWidget as jest.Mock
const useIsSafeAppMock = useIsSafeApp as jest.Mock
const useHasBridgeProvidersMock = useHasBridgeProviders as jest.Mock
const useInjectedWidgetParamsMock = useInjectedWidgetParams as jest.Mock
const useTradeTypeInfoMock = useTradeTypeInfo as jest.Mock

describe('BridgingEnabledUpdater', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useSetIsBridgingEnabledMock.mockReturnValue(setIsBridgingEnabledMock)
    useFeatureFlagsMock.mockReturnValue({ isBridgingInSafeWidgetEnabled: false })
    isInjectedWidgetMock.mockReturnValue(false)
    useIsSafeAppMock.mockReturnValue(false)
    useHasBridgeProvidersMock.mockReturnValue(true)
    useInjectedWidgetParamsMock.mockReturnValue({})
  })

  it('enables bridging on the Swap route', () => {
    useTradeTypeInfoMock.mockReturnValue({ route: Routes.SWAP })

    render(<BridgingEnabledUpdater />)

    expect(setIsBridgingEnabledMock).toHaveBeenLastCalledWith(true)
  })

  it('disables bridging on the Hooks route (bridge orders do not support partial fills)', () => {
    useTradeTypeInfoMock.mockReturnValue({ route: Routes.HOOKS })

    render(<BridgingEnabledUpdater />)

    expect(setIsBridgingEnabledMock).toHaveBeenLastCalledWith(false)
  })

  it('disables bridging on non-swap routes', () => {
    useTradeTypeInfoMock.mockReturnValue({ route: Routes.LIMIT_ORDERS })

    render(<BridgingEnabledUpdater />)

    expect(setIsBridgingEnabledMock).toHaveBeenLastCalledWith(false)
  })

  it('respects disableCrossChainSwap widget param on Swap route', () => {
    useTradeTypeInfoMock.mockReturnValue({ route: Routes.SWAP })
    useInjectedWidgetParamsMock.mockReturnValue({ disableCrossChainSwap: true })

    render(<BridgingEnabledUpdater />)

    expect(setIsBridgingEnabledMock).toHaveBeenLastCalledWith(false)
  })

  it('disables bridging when there are no bridge providers', () => {
    useTradeTypeInfoMock.mockReturnValue({ route: Routes.SWAP })
    useHasBridgeProvidersMock.mockReturnValue(false)

    render(<BridgingEnabledUpdater />)

    expect(setIsBridgingEnabledMock).toHaveBeenLastCalledWith(false)
  })

  it('disables bridging inside a widget hosted in a Safe app', () => {
    useTradeTypeInfoMock.mockReturnValue({ route: Routes.SWAP })
    useIsSafeAppMock.mockReturnValue(true)
    isInjectedWidgetMock.mockReturnValue(true)

    render(<BridgingEnabledUpdater />)

    expect(setIsBridgingEnabledMock).toHaveBeenLastCalledWith(false)
  })

  it('keeps bridging enabled inside a Safe widget when the feature flag is on', () => {
    useTradeTypeInfoMock.mockReturnValue({ route: Routes.SWAP })
    useIsSafeAppMock.mockReturnValue(true)
    isInjectedWidgetMock.mockReturnValue(true)
    useFeatureFlagsMock.mockReturnValue({ isBridgingInSafeWidgetEnabled: true })

    render(<BridgingEnabledUpdater />)

    expect(setIsBridgingEnabledMock).toHaveBeenLastCalledWith(true)
  })
})
