import { useAtomValue } from 'jotai'

import { useMediaQuery } from '@cowprotocol/common-hooks'

import { act, renderHook } from '@testing-library/react'
import { OrderTabId } from 'entities/routes/routes.atom'

import { useSetOrdersTableDrawerOpen, useTradeConfirmActions } from 'modules/trade'

import { useNavigateToOrdersTableTab } from './tabs/useNavigateToOrdersTableTab'
import { useRevealOrderInOrdersTable } from './useRevealOrderInOrdersTable'
import { useViewPlacedOrder } from './useViewPlacedOrder'

import { placedOrderHighlightAtom } from '../state/placedOrderHighlightAtom'

jest.mock('@cowprotocol/common-hooks', () => ({
  ...jest.requireActual('@cowprotocol/common-hooks'),
  useMediaQuery: jest.fn(),
}))

jest.mock('jotai', () => ({
  ...jest.requireActual('jotai'),
  useAtomValue: jest.fn(),
}))

jest.mock('modules/trade', () => ({
  useSetOrdersTableDrawerOpen: jest.fn(),
  useTradeConfirmActions: jest.fn(),
}))

jest.mock('./useRevealOrderInOrdersTable', () => ({
  useRevealOrderInOrdersTable: jest.fn(),
}))

jest.mock('./tabs/useNavigateToOrdersTableTab', () => ({
  useNavigateToOrdersTableTab: jest.fn(),
}))

const mockedUseRevealOrderInOrdersTable = useRevealOrderInOrdersTable as jest.MockedFunction<
  typeof useRevealOrderInOrdersTable
>
const mockedUseMediaQuery = useMediaQuery as jest.MockedFunction<typeof useMediaQuery>
const mockedUseAtomValue = useAtomValue as jest.MockedFunction<typeof useAtomValue>
const mockedUseNavigateToOrdersTableTab = useNavigateToOrdersTableTab as jest.MockedFunction<
  typeof useNavigateToOrdersTableTab
>
const mockedUseSetOrdersTableDrawerOpen = useSetOrdersTableDrawerOpen as jest.MockedFunction<
  typeof useSetOrdersTableDrawerOpen
>
const mockedUseTradeConfirmActions = useTradeConfirmActions as jest.MockedFunction<typeof useTradeConfirmActions>

describe('useViewPlacedOrder()', () => {
  const onDismiss = jest.fn()
  const setOrdersTableDrawerOpen = jest.fn()
  const revealOrderInOrdersTable = jest.fn()
  const navigateToOrdersTableTab = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseSetOrdersTableDrawerOpen.mockReturnValue(setOrdersTableDrawerOpen)
    mockedUseRevealOrderInOrdersTable.mockReturnValue(revealOrderInOrdersTable)
    mockedUseNavigateToOrdersTableTab.mockReturnValue(navigateToOrdersTableTab)
    mockedUseTradeConfirmActions.mockReturnValue({ onDismiss } as ReturnType<typeof useTradeConfirmActions>)
    mockedUseAtomValue.mockImplementation((atom) => {
      if (atom === placedOrderHighlightAtom) {
        return { orderId: '0xorder', tabId: OrderTabId.OPEN }
      }

      return null
    })
  })

  it('dismisses the success screen and highlights the placed order on desktop', () => {
    mockedUseMediaQuery.mockReturnValue(false)

    const { result } = renderHook(() => useViewPlacedOrder())

    act(() => {
      result.current()
    })

    expect(onDismiss).toHaveBeenCalledTimes(1)
    expect(setOrdersTableDrawerOpen).not.toHaveBeenCalled()
    expect(revealOrderInOrdersTable).toHaveBeenCalledWith('0xorder', OrderTabId.OPEN, { revealWhenInDrawer: true })
  })

  it('opens the orders drawer on a small screen and highlights the placed order', () => {
    mockedUseMediaQuery.mockReturnValue(true)
    mockedUseAtomValue.mockImplementation((atom) => {
      if (atom === placedOrderHighlightAtom) {
        return { orderId: '0xtwap', tabId: OrderTabId.SIGNING }
      }

      return null
    })

    const { result } = renderHook(() => useViewPlacedOrder())

    act(() => {
      result.current()
    })

    expect(setOrdersTableDrawerOpen).toHaveBeenCalledWith(true)
    expect(revealOrderInOrdersTable).toHaveBeenCalledWith('0xtwap', OrderTabId.SIGNING, { revealWhenInDrawer: true })
  })

  it('uses a custom dismiss callback when one is provided', () => {
    mockedUseMediaQuery.mockReturnValue(false)
    const customDismiss = jest.fn()

    const { result } = renderHook(() => useViewPlacedOrder(customDismiss))

    act(() => {
      result.current()
    })

    expect(customDismiss).toHaveBeenCalledTimes(1)
    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('switches to the stored tab when the order id is missing', () => {
    mockedUseMediaQuery.mockReturnValue(true)
    mockedUseAtomValue.mockImplementation((atom) => {
      if (atom === placedOrderHighlightAtom) {
        return { orderId: null, tabId: OrderTabId.OPEN }
      }

      return null
    })

    const { result } = renderHook(() => useViewPlacedOrder())

    act(() => {
      result.current()
    })

    expect(setOrdersTableDrawerOpen).toHaveBeenCalledWith(true)
    expect(revealOrderInOrdersTable).not.toHaveBeenCalled()
    expect(navigateToOrdersTableTab).toHaveBeenCalledWith(OrderTabId.OPEN)
  })

  it('dismisses without navigating when no order was stored', () => {
    mockedUseMediaQuery.mockReturnValue(false)
    mockedUseAtomValue.mockReturnValue(null)

    const { result } = renderHook(() => useViewPlacedOrder())

    act(() => {
      result.current()
    })

    expect(onDismiss).toHaveBeenCalledTimes(1)
    expect(revealOrderInOrdersTable).not.toHaveBeenCalled()
    expect(navigateToOrdersTableTab).not.toHaveBeenCalled()
  })
})
