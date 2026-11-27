import { createStore, Provider } from 'jotai'
import { ReactNode } from 'react'

import { useMediaQuery } from '@cowprotocol/common-hooks'
import { Fraction } from '@cowprotocol/currency'

import { act, renderHook } from '@testing-library/react'

import { priceChartModalOpenAtom, usePriceChartVisibility } from 'modules/priceChart'

import { useLimitOrdersDerivedState } from './useLimitOrdersDerivedState'
import { useLimitPriceChartPicker } from './useLimitPriceChartPicker'
import { useUpdateActiveRate } from './useUpdateActiveRate'

import { limitPickerModeAtom } from '../state/limitPickerModeAtom'

jest.mock('@cowprotocol/common-hooks', () => ({ useMediaQuery: jest.fn() }))
jest.mock('modules/priceChart', () => ({
  priceChartModalOpenAtom: jest.requireActual('jotai').atom(false),
  usePriceChartVisibility: jest.fn(),
}))
jest.mock('./useLimitOrdersDerivedState', () => ({ useLimitOrdersDerivedState: jest.fn() }))
jest.mock('./useUpdateActiveRate', () => ({ useUpdateActiveRate: jest.fn() }))

const mockUseMediaQuery = useMediaQuery as jest.MockedFunction<typeof useMediaQuery>
const mockUsePriceChartVisibility = usePriceChartVisibility as jest.MockedFunction<typeof usePriceChartVisibility>
const mockUseLimitOrdersDerivedState = useLimitOrdersDerivedState as jest.MockedFunction<
  typeof useLimitOrdersDerivedState
>
const mockUseUpdateActiveRate = useUpdateActiveRate as jest.MockedFunction<typeof useUpdateActiveRate>

const updateRate = jest.fn()

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function renderPicker(store: ReturnType<typeof createStore>) {
  const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>

  return renderHook(() => useLimitPriceChartPicker(), { wrapper })
}

describe('useLimitPriceChartPicker', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseMediaQuery.mockReturnValue(false)
    mockUsePriceChartVisibility.mockReturnValue(true)
    mockUseLimitOrdersDerivedState.mockReturnValue({ isUnlocked: true } as ReturnType<
      typeof useLimitOrdersDerivedState
    >)
    mockUseUpdateActiveRate.mockReturnValue(updateRate)
  })

  it('keeps picker mode on while the chart is shown on desktop', () => {
    const store = createStore()
    store.set(limitPickerModeAtom, true)

    const { result } = renderPicker(store)

    expect(store.get(limitPickerModeAtom)).toBe(true)
    expect(result.current).toEqual(expect.any(Function))
  })

  it('turns picker mode off when the chart is hidden on desktop', () => {
    const store = createStore()
    store.set(limitPickerModeAtom, true)
    const { rerender, result } = renderPicker(store)

    mockUsePriceChartVisibility.mockReturnValue(false)
    rerender()

    expect(store.get(limitPickerModeAtom)).toBe(false)
    expect(result.current).toBeUndefined()
  })

  it('turns picker mode off when the chart dialog is closed below the desktop layout', () => {
    mockUseMediaQuery.mockReturnValue(true)
    const store = createStore()
    store.set(limitPickerModeAtom, true)
    store.set(priceChartModalOpenAtom, true)
    renderPicker(store)

    act(() => store.set(priceChartModalOpenAtom, false))

    expect(store.get(limitPickerModeAtom)).toBe(false)
  })

  it('keeps picker mode on when the dialog opens together with the picker', () => {
    mockUseMediaQuery.mockReturnValue(true)
    const store = createStore()
    renderPicker(store)

    act(() => {
      store.set(priceChartModalOpenAtom, true)
      store.set(limitPickerModeAtom, true)
    })

    expect(store.get(limitPickerModeAtom)).toBe(true)
  })

  it('updates the rate and closes the chart dialog after a price is picked', () => {
    mockUseMediaQuery.mockReturnValue(true)
    const store = createStore()
    store.set(limitPickerModeAtom, true)
    store.set(priceChartModalOpenAtom, true)
    const { result } = renderPicker(store)
    const rate = new Fraction(3, 2)

    act(() => result.current?.(rate))

    expect(updateRate).toHaveBeenCalledWith({
      activeRate: rate,
      isAlternativeOrderRate: false,
      isRateFromUrl: false,
      isTypedValue: false,
    })
    expect(store.get(limitPickerModeAtom)).toBe(false)
    expect(store.get(priceChartModalOpenAtom)).toBe(false)
  })
})
