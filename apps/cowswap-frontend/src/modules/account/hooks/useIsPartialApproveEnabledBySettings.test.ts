import { useAtomValue } from 'jotai'

import { UiOrderType } from '@cowprotocol/types'

import { renderHook } from '@testing-library/react'

import { advancedOrdersSettingsAtom } from 'modules/advancedOrders/state/advancedOrdersSettingsAtom'
import { limitOrdersSettingsAtom } from 'modules/limitOrders'
import { useSwapPartialApprovalToggleState } from 'modules/swap/hooks/useSwapSettings'

import {
  getIsPartialApproveEnabledBySettings,
  useIsPartialApproveEnabledBySettings,
} from './useIsPartialApproveEnabledBySettings'

jest.mock('jotai', () => ({ ...jest.requireActual('jotai'), useAtomValue: jest.fn() }))

jest.mock('modules/advancedOrders/state/advancedOrdersSettingsAtom', () => ({
  advancedOrdersSettingsAtom: 'advancedOrdersSettingsAtom',
}))

jest.mock('modules/limitOrders', () => ({ limitOrdersSettingsAtom: 'limitOrdersSettingsAtom' }))

jest.mock('modules/swap/hooks/useSwapSettings', () => ({ useSwapPartialApprovalToggleState: jest.fn() }))

const mockedUseAtomValue = useAtomValue as jest.MockedFunction<typeof useAtomValue>
const mockedUseSwapPartialApprovalToggleState = useSwapPartialApprovalToggleState as jest.MockedFunction<
  typeof useSwapPartialApprovalToggleState
>

function mockSettings(limit: boolean, twap: boolean): void {
  mockedUseAtomValue.mockImplementation((atom) => {
    if (atom === limitOrdersSettingsAtom) return { enablePartialApprovalBySettings: limit }
    if (atom === advancedOrdersSettingsAtom) return { enablePartialApprovalBySettings: twap }
    return undefined
  })
}

describe('useIsPartialApproveEnabledBySettings', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseSwapPartialApprovalToggleState.mockReturnValue([true, jest.fn()])
    mockSettings(false, false)
  })

  it('reads the swap setting for SWAP orders', () => {
    const { result } = renderHook(() => useIsPartialApproveEnabledBySettings(UiOrderType.SWAP))

    expect(result.current).toBe(true)
  })

  it('reads the swap setting for HOOKS orders', () => {
    const { result } = renderHook(() => useIsPartialApproveEnabledBySettings(UiOrderType.HOOKS))

    expect(result.current).toBe(true)
  })

  it('reads the limit orders setting for LIMIT orders', () => {
    mockSettings(true, false)

    const { result } = renderHook(() => useIsPartialApproveEnabledBySettings(UiOrderType.LIMIT))

    expect(result.current).toBe(true)
  })

  it('reads the advanced orders (TWAP) setting for TWAP orders', () => {
    mockSettings(false, true)

    const { result } = renderHook(() => useIsPartialApproveEnabledBySettings(UiOrderType.TWAP))

    expect(result.current).toBe(true)
  })

  it('returns false for YIELD orders and unresolved order types, regardless of settings', () => {
    mockedUseSwapPartialApprovalToggleState.mockReturnValue([true, jest.fn()])
    mockSettings(true, true)

    expect(renderHook(() => useIsPartialApproveEnabledBySettings(UiOrderType.YIELD)).result.current).toBe(false)
    expect(renderHook(() => useIsPartialApproveEnabledBySettings(undefined)).result.current).toBe(false)
  })
})

describe('getIsPartialApproveEnabledBySettings', () => {
  const cases: Array<[UiOrderType | undefined, { swap: boolean; limit: boolean; twap: boolean }, boolean]> = [
    [UiOrderType.SWAP, { swap: true, limit: false, twap: false }, true],
    [UiOrderType.SWAP, { swap: false, limit: true, twap: true }, false],
    [UiOrderType.HOOKS, { swap: true, limit: false, twap: false }, true],
    [UiOrderType.LIMIT, { swap: false, limit: true, twap: false }, true],
    [UiOrderType.LIMIT, { swap: true, limit: false, twap: true }, false],
    [UiOrderType.TWAP, { swap: false, limit: false, twap: true }, true],
    [UiOrderType.TWAP, { swap: true, limit: true, twap: false }, false],
    [UiOrderType.YIELD, { swap: true, limit: true, twap: true }, false],
    [undefined, { swap: true, limit: true, twap: true }, false],
  ]

  it.each(cases)('resolves %s to %s', (uiOrderType, settings, expected) => {
    expect(getIsPartialApproveEnabledBySettings(uiOrderType, settings)).toBe(expected)
  })
})
