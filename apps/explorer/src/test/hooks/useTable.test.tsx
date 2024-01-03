import { act, renderHook } from '@testing-library/react-hooks'
import { useTable } from 'apps/explorer/components/OrdersTableWidget/useTable'

describe('when rendered', () => {
  it('returns current initial value', () => {
    const { result } = renderHook(() => useTable({ initialState: { pageOffset: 0, pageSize: 50 } }))

    expect(result.current.state.pageSize).toEqual(50)
    expect(result.current.state.pageOffset).toEqual(0)
    expect(result.current.state.pageIndex).toEqual(1)
  })

  it('should restarted tableState when setPage is used', () => {
    const { result } = renderHook(() => useTable({ initialState: { pageOffset: 20, pageSize: 20 } }))
    // Given
    expect(result.current.state).toMatchObject({ pageIndex: 2, pageOffset: 20, pageSize: 20 })

    // When
    act(() => {
      result.current.setPageSize(50)
    })

    // Result
    expect(result.current.state).toMatchObject({ pageIndex: 1, pageOffset: 0, pageSize: 50 })
  })

  it('should increase pageOffset, pageIndex when handleNextPage', () => {
    const { result } = renderHook(() => useTable({ initialState: { pageOffset: 0, pageSize: 20 } }))

    act(() => {
      result.current.handleNextPage()
    })

    expect(result.current.state).toMatchObject({ pageIndex: 2, pageOffset: 20, pageSize: 20 })
  })

  it('should  decrease pageOffset, pageIndex when handlePreviousPage', () => {
    const { result } = renderHook(() => useTable({ initialState: { pageOffset: 60, pageSize: 20 } }))
    expect(result.current.state).toMatchObject({ pageIndex: 4, pageOffset: 60, pageSize: 20 })

    act(() => {
      result.current.handlePreviousPage()
    })

    expect(result.current.state).toMatchObject({ pageIndex: 3, pageOffset: 40, pageSize: 20 })
  })
})
