import { TradeType } from '@cowprotocol/widget-lib'

import { renderHook } from '@testing-library/react'
import { useInjectedWidgetParams } from 'entities/injectedWidget'

import { useAuthWrapper } from './useAuthWrapper'

import type { CowAuthWrapperConfig } from '../authWrapper.types'

jest.mock('entities/injectedWidget', () => ({ useInjectedWidgetParams: jest.fn() }))

const mockUseInjectedWidgetParams = useInjectedWidgetParams as jest.MockedFunction<typeof useInjectedWidgetParams>

const WRAPPER_ADDRESS = '0x1111111111111111111111111111111111111111'

const CONFIG: CowAuthWrapperConfig = {
  address: WRAPPER_ADDRESS,
  paramsType: 'SwapParams',
  paramsField: 'wrapperData',
  types: { SwapParams: [{ name: 'target', type: 'address' }] },
  params: { target: WRAPPER_ADDRESS },
}

function setParams(authWrapper: unknown): void {
  mockUseInjectedWidgetParams.mockReturnValue({ authWrapper } as ReturnType<typeof useInjectedWidgetParams>)
}

describe('useAuthWrapper', () => {
  it('returns null when no wrapper is configured', () => {
    setParams(undefined)

    expect(renderHook(() => useAuthWrapper(1, TradeType.SWAP)).result.current).toBeNull()
  })

  it('returns null before the trade type is known', () => {
    setParams(CONFIG)

    expect(renderHook(() => useAuthWrapper(1, undefined)).result.current).toBeNull()
  })

  it('resolves a plain config', () => {
    setParams(CONFIG)

    expect(renderHook(() => useAuthWrapper(1, TradeType.SWAP)).result.current?.address).toBe(WRAPPER_ADDRESS)
  })

  it('resolves a per-network config for the active chain only', () => {
    setParams({ 1: CONFIG })

    expect(renderHook(() => useAuthWrapper(1, TradeType.SWAP)).result.current?.address).toBe(WRAPPER_ADDRESS)
    expect(renderHook(() => useAuthWrapper(100, TradeType.SWAP)).result.current).toBeNull()
  })

  it('resolves a per-trade-type config for the active trade type only', () => {
    setParams({ [TradeType.SWAP]: CONFIG })

    expect(renderHook(() => useAuthWrapper(1, TradeType.SWAP)).result.current?.address).toBe(WRAPPER_ADDRESS)
    expect(renderHook(() => useAuthWrapper(1, TradeType.LIMIT)).result.current).toBeNull()
  })

  /**
   * An invalid config is reported to the integrator by `validateAuthWrapper`, which
   * blocks the widget outright, so there is nothing to fall back from here.
   */
  it('returns null for an invalid config instead of throwing', () => {
    setParams({ ...CONFIG, address: 'nope' })

    expect(renderHook(() => useAuthWrapper(1, TradeType.SWAP)).result.current).toBeNull()
  })
})
