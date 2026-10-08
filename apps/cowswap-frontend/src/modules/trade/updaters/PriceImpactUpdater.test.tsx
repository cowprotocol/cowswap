import { createStore, Provider } from 'jotai'
import { ReactNode } from 'react'

import { Percent } from '@cowprotocol/currency'

import { act, render } from '@testing-library/react'

import { useFiatValuePriceImpact } from 'legacy/hooks/usePriceImpact'

import { PriceImpactUpdater } from './PriceImpactUpdater'

import { priceImpactAtom } from '../state/priceImpactAtom'

jest.mock('legacy/hooks/usePriceImpact', () => ({
  useFiatValuePriceImpact: jest.fn(),
}))

const mockedUseFiatValuePriceImpact = useFiatValuePriceImpact as jest.MockedFunction<typeof useFiatValuePriceImpact>

const settledImpact = new Percent(1, 100)
const nextImpact = new Percent(2, 100)

function Harness({ store }: { store: ReturnType<typeof createStore> }): ReactNode {
  return (
    <Provider store={store}>
      <PriceImpactUpdater />
    </Provider>
  )
}

describe('PriceImpactUpdater', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('skips a loading state that reverts within the throttle window', () => {
    const store = createStore()
    const writes: unknown[] = []
    store.sub(priceImpactAtom, () => writes.push(store.get(priceImpactAtom)))

    mockedUseFiatValuePriceImpact.mockReturnValue({ priceImpact: settledImpact, isLoading: false })
    const { rerender } = render(<Harness store={store} />)

    act(() => {
      jest.advanceTimersByTime(200)
    })

    expect(store.get(priceImpactAtom)).toEqual({ priceImpact: settledImpact, loading: false })

    mockedUseFiatValuePriceImpact.mockReturnValue({ priceImpact: undefined, isLoading: true })
    rerender(<Harness store={store} />)

    act(() => {
      jest.advanceTimersByTime(100)
    })

    mockedUseFiatValuePriceImpact.mockReturnValue({ priceImpact: nextImpact, isLoading: false })
    rerender(<Harness store={store} />)

    act(() => {
      jest.advanceTimersByTime(100)
    })

    expect(store.get(priceImpactAtom)).toEqual({ priceImpact: nextImpact, loading: false })
    expect(writes).not.toContainEqual({ priceImpact: undefined, loading: true })
  })

  it('writes a loading state that lasts longer than the throttle window', () => {
    const store = createStore()

    mockedUseFiatValuePriceImpact.mockReturnValue({ priceImpact: undefined, isLoading: true })
    render(<Harness store={store} />)

    act(() => {
      jest.advanceTimersByTime(200)
    })

    expect(store.get(priceImpactAtom)).toEqual({ priceImpact: undefined, loading: true })
  })
})
