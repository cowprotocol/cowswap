import { act, renderHook } from '@testing-library/react'

import { useIsPriceChanged } from './useIsPriceChanged'

describe('useIsPriceChanged', () => {
  it('starts unchanged and takes the mounted amounts as the baseline', () => {
    const { result, rerender } = renderHook(({ input, output }) => useIsPriceChanged(input, output), {
      initialProps: { input: '1', output: '2' },
    })

    expect(result.current.isPriceChanged).toBe(false)

    rerender({ input: '1', output: '2' })
    expect(result.current.isPriceChanged).toBe(false)

    rerender({ input: '1', output: '2.1' })
    expect(result.current.isPriceChanged).toBe(true)
  })

  it('rebaselines on accept, so the banner only returns on the next change', () => {
    const { result, rerender } = renderHook(({ input, output }) => useIsPriceChanged(input, output), {
      initialProps: { input: '1', output: '2' },
    })

    rerender({ input: '1', output: '2.1' })
    act(() => result.current.resetPriceChanged())

    expect(result.current.isPriceChanged).toBe(false)

    rerender({ input: '1', output: '2.2' })
    expect(result.current.isPriceChanged).toBe(true)
  })

  // Reopening the review screen after an expired Solana signing window passes `forcePriceConfirmation`,
  // which has to survive the mount-time baseline reset - otherwise the user never has to accept the
  // quote that refreshed while the wallet prompt was open.
  it('reports a changed price right after mount when price confirmation is forced', () => {
    const { result } = renderHook(() => useIsPriceChanged('1', '2', true))

    expect(result.current.isPriceChanged).toBe(true)
  })

  it('still lets the forced confirmation be accepted', () => {
    const { result } = renderHook(() => useIsPriceChanged('1', '2', true))

    act(() => result.current.resetPriceChanged())

    expect(result.current.isPriceChanged).toBe(false)
  })
})
