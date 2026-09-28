import { useMediaQuery } from '@cowprotocol/common-hooks'

import { act, renderHook } from '@testing-library/react'
import { OrderTabId } from 'entities/routes/routes.atom'

import { useRevealOrderInOrdersTable } from 'modules/ordersTable'
import { useSetOrdersTableDrawerOpen } from 'modules/trade'

import { useEoaTwapSigningStep } from './useEoaTwapSigningStep'
import { useEoaTwapSuccessDismiss } from './useEoaTwapSuccessDismiss'

jest.mock('@cowprotocol/common-hooks', () => ({
  ...jest.requireActual('@cowprotocol/common-hooks'),
  useMediaQuery: jest.fn(),
}))

jest.mock('modules/ordersTable', () => ({
  useRevealOrderInOrdersTable: jest.fn(),
}))

jest.mock('modules/trade', () => ({
  useSetOrdersTableDrawerOpen: jest.fn(),
}))

jest.mock('./useEoaTwapSigningStep', () => ({
  useEoaTwapSigningStep: jest.fn(),
}))

const mockedUseMediaQuery = useMediaQuery as jest.MockedFunction<typeof useMediaQuery>
const mockedUseSetOrdersTableDrawerOpen = useSetOrdersTableDrawerOpen as jest.MockedFunction<
  typeof useSetOrdersTableDrawerOpen
>
const mockedUseRevealOrderInOrdersTable = useRevealOrderInOrdersTable as jest.MockedFunction<
  typeof useRevealOrderInOrdersTable
>
const mockedUseEoaTwapSigningStep = useEoaTwapSigningStep as jest.MockedFunction<typeof useEoaTwapSigningStep>

describe('useEoaTwapSuccessDismiss()', () => {
  const onDismiss = jest.fn()
  const setOrdersTableDrawerOpen = jest.fn()
  const revealOrderInOrdersTable = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseSetOrdersTableDrawerOpen.mockReturnValue(setOrdersTableDrawerOpen)
    mockedUseRevealOrderInOrdersTable.mockReturnValue(revealOrderInOrdersTable)
    mockedUseEoaTwapSigningStep.mockReturnValue({
      eventId: 'event-1',
    } as ReturnType<typeof useEoaTwapSigningStep>)
  })

  it('dismisses the success state on desktop without opening the orders drawer', () => {
    mockedUseMediaQuery.mockReturnValue(false)

    const { result } = renderHook(() => useEoaTwapSuccessDismiss(onDismiss))

    act(() => {
      result.current()
    })

    expect(onDismiss).toHaveBeenCalledTimes(1)
    expect(setOrdersTableDrawerOpen).not.toHaveBeenCalled()
    expect(revealOrderInOrdersTable).not.toHaveBeenCalled()
  })

  it('opens the orders drawer on mobile and pulses the placed order', () => {
    mockedUseMediaQuery.mockReturnValue(true)

    const { result } = renderHook(() => useEoaTwapSuccessDismiss(onDismiss))

    act(() => {
      result.current()
    })

    expect(onDismiss).toHaveBeenCalledTimes(1)
    expect(setOrdersTableDrawerOpen).toHaveBeenCalledWith(true)
    expect(revealOrderInOrdersTable).toHaveBeenCalledWith('event-1', OrderTabId.OPEN)
  })

  it('opens the orders drawer on mobile without pulsing when the order id is missing', () => {
    mockedUseMediaQuery.mockReturnValue(true)
    mockedUseEoaTwapSigningStep.mockReturnValue(null)

    const { result } = renderHook(() => useEoaTwapSuccessDismiss(onDismiss))

    act(() => {
      result.current()
    })

    expect(setOrdersTableDrawerOpen).toHaveBeenCalledWith(true)
    expect(revealOrderInOrdersTable).not.toHaveBeenCalled()
  })
})
