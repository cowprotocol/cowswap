import { useMediaQuery } from '@cowprotocol/common-hooks'

import { act, renderHook } from '@testing-library/react'

import { useSetOrdersTableDrawerOpen } from 'modules/trade'

import { useEoaTwapSuccessDismiss } from './useEoaTwapSuccessDismiss'

jest.mock('@cowprotocol/common-hooks', () => ({
  ...jest.requireActual('@cowprotocol/common-hooks'),
  useMediaQuery: jest.fn(),
}))

jest.mock('modules/trade', () => ({
  useSetOrdersTableDrawerOpen: jest.fn(),
}))

const mockedUseMediaQuery = useMediaQuery as jest.MockedFunction<typeof useMediaQuery>
const mockedUseSetOrdersTableDrawerOpen = useSetOrdersTableDrawerOpen as jest.MockedFunction<
  typeof useSetOrdersTableDrawerOpen
>

describe('useEoaTwapSuccessDismiss()', () => {
  const onDismiss = jest.fn()
  const setOrdersTableDrawerOpen = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseSetOrdersTableDrawerOpen.mockReturnValue(setOrdersTableDrawerOpen)
  })

  it('dismisses the success state on desktop without opening the orders drawer', () => {
    mockedUseMediaQuery.mockReturnValue(false)

    const { result } = renderHook(() => useEoaTwapSuccessDismiss(onDismiss))

    act(() => {
      result.current()
    })

    expect(onDismiss).toHaveBeenCalledTimes(1)
    expect(setOrdersTableDrawerOpen).not.toHaveBeenCalled()
  })

  it('opens the orders drawer on mobile after dismissing the success state', () => {
    mockedUseMediaQuery.mockReturnValue(true)

    const { result } = renderHook(() => useEoaTwapSuccessDismiss(onDismiss))

    act(() => {
      result.current()
    })

    expect(onDismiss).toHaveBeenCalledTimes(1)
    expect(setOrdersTableDrawerOpen).toHaveBeenCalledWith(true)
  })
})
