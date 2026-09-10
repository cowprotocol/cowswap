import { act, renderHook } from '@testing-library/react'

import { useFreezeOnConfirm } from './useFreezeOnConfirm'

describe('useFreezeOnConfirm', () => {
  it('tracks live props until confirm is clicked', () => {
    const { result, rerender } = renderHook(({ amount }) => useFreezeOnConfirm({ amount }, jest.fn()), {
      initialProps: { amount: '100' },
    })

    expect(result.current.props.amount).toBe('100')
    expect(result.current.isConfirming).toBe(false)

    rerender({ amount: '105' })
    expect(result.current.props.amount).toBe('105')
  })

  it('keeps the amount that was on screen at click time, ignoring quote refreshes', async () => {
    // Never settles: the wallet prompt is open and the user hasn't signed yet.
    const onConfirm = jest.fn().mockReturnValue(new Promise<boolean>(() => undefined))
    const { result, rerender } = renderHook(({ amount }) => useFreezeOnConfirm({ amount }, onConfirm), {
      initialProps: { amount: '100' },
    })

    await act(async () => {
      result.current.handleConfirm()
    })

    expect(result.current.isConfirming).toBe(true)

    rerender({ amount: '105' })
    expect(result.current.props.amount).toBe('100')

    rerender({ amount: '110' })
    expect(result.current.props.amount).toBe('100')
  })

  it('goes back to live props when the attempt is aborted', async () => {
    // Falsy result: e.g. the user declined the price-impact confirmation.
    const onConfirm = jest.fn().mockResolvedValue(false)
    const { result, rerender } = renderHook(({ amount }) => useFreezeOnConfirm({ amount }, onConfirm), {
      initialProps: { amount: '100' },
    })

    await act(async () => {
      await result.current.handleConfirm()
    })

    expect(result.current.isConfirming).toBe(false)

    rerender({ amount: '105' })
    expect(result.current.props.amount).toBe('105')
  })

  it('goes back to live props when the flow throws, and rethrows', async () => {
    const onConfirm = jest.fn().mockRejectedValue(new Error('user rejected'))
    const { result, rerender } = renderHook(({ amount }) => useFreezeOnConfirm({ amount }, onConfirm), {
      initialProps: { amount: '100' },
    })

    await act(async () => {
      await expect(result.current.handleConfirm()).rejects.toThrow('user rejected')
    })

    expect(result.current.isConfirming).toBe(false)

    rerender({ amount: '105' })
    expect(result.current.props.amount).toBe('105')
  })

  it('stays frozen after a successful confirmation', async () => {
    const onConfirm = jest.fn().mockResolvedValue(true)
    const { result, rerender } = renderHook(({ amount }) => useFreezeOnConfirm({ amount }, onConfirm), {
      initialProps: { amount: '100' },
    })

    await act(async () => {
      await result.current.handleConfirm()
    })

    rerender({ amount: '105' })
    expect(result.current.isConfirming).toBe(true)
    expect(result.current.props.amount).toBe('100')
  })
})
