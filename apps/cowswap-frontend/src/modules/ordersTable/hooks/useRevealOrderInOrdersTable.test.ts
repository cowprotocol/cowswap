import { useSetAtom } from 'jotai'

import { renderHook } from '@testing-library/react'
import { OrderTabId } from 'entities/routes/routes.atom'

import { useNavigateToOrdersTableTab } from './tabs/useNavigateToOrdersTableTab'
import { useRevealOrderInOrdersTable } from './useRevealOrderInOrdersTable'

import { resetOrdersTableFiltersAtom } from '../state/filters/ordersTableFilters.atom'
import { highlightOrderRow } from '../utils/highlightOrderRow.utils'

jest.mock('jotai', () => ({
  ...jest.requireActual('jotai'),
  useSetAtom: jest.fn(),
}))

jest.mock('./tabs/useNavigateToOrdersTableTab', () => ({
  useNavigateToOrdersTableTab: jest.fn(),
}))

jest.mock('../utils/highlightOrderRow.utils', () => ({
  highlightOrderRow: jest.fn(),
}))

const mockedUseSetAtom = useSetAtom as jest.MockedFunction<typeof useSetAtom>
const mockedUseNavigateToOrdersTableTab = useNavigateToOrdersTableTab as jest.MockedFunction<
  typeof useNavigateToOrdersTableTab
>
const mockedHighlightOrderRow = highlightOrderRow as jest.MockedFunction<typeof highlightOrderRow>

describe('useRevealOrderInOrdersTable', () => {
  const resetOrdersTableFilters = jest.fn()
  const navigateToOrdersTableTab = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseSetAtom.mockImplementation((atom) => {
      if (atom === resetOrdersTableFiltersAtom) {
        return resetOrdersTableFilters
      }

      return jest.fn()
    })
    mockedUseNavigateToOrdersTableTab.mockReturnValue(navigateToOrdersTableTab)
  })

  it('returns true and does not reset filters when the row is already visible', async () => {
    mockedHighlightOrderRow.mockResolvedValue(true)

    const { result } = renderHook(() => useRevealOrderInOrdersTable())

    await expect(result.current('order-1', OrderTabId.OPEN)).resolves.toBe(true)

    expect(mockedHighlightOrderRow).toHaveBeenCalledTimes(1)
    expect(resetOrdersTableFilters).not.toHaveBeenCalled()
    expect(navigateToOrdersTableTab).not.toHaveBeenCalled()
  })

  it('resets filters, navigates, and highlights again when the row is not visible', async () => {
    mockedHighlightOrderRow.mockResolvedValueOnce(false).mockResolvedValueOnce(true)

    const { result } = renderHook(() => useRevealOrderInOrdersTable())

    await expect(result.current('order-1', OrderTabId.SIGNING)).resolves.toBe(false)

    expect(resetOrdersTableFilters).toHaveBeenCalledTimes(1)
    expect(navigateToOrdersTableTab).toHaveBeenCalledWith(OrderTabId.SIGNING)
    expect(mockedHighlightOrderRow).toHaveBeenCalledTimes(2)
  })
})
