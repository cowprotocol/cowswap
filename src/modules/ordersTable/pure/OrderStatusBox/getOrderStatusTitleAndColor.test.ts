import { DefaultTheme } from 'styled-components/macro'
import { instance, mock, when } from 'ts-mockito'

import { OrderStatus } from 'legacy/state/orders/actions'

import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import { getOrderStatusTitleAndColor } from './getOrderStatusTitleAndColor'

describe('getOrderStatusTitleAndColor()', () => {
  let themeMock: DefaultTheme
  let orderMock: ParsedOrder

  beforeEach(() => {
    themeMock = mock<DefaultTheme>()

    when(themeMock.text1).thenReturn('text1')
    when(themeMock.text3).thenReturn('text3')
    when(themeMock.warning).thenReturn('warning')
    when(themeMock.danger).thenReturn('danger')
    when(themeMock.success).thenReturn('success')

    orderMock = mock<ParsedOrder>()
  })

  const getResult = () => getOrderStatusTitleAndColor(instance(orderMock), instance(themeMock))

  describe('When order is in confirmed state', () => {
    it('Then should not display isCancelling state', () => {
      when(orderMock.status).thenReturn(OrderStatus.FULFILLED)
      when(orderMock.isCancelling).thenReturn(true)

      const result = getResult()

      expect(result.title).toBe('Filled')
      expect(result.color).toBe('success')
    })

    it('Then should display partiallyFilled state', () => {
      when(orderMock.status).thenReturn(OrderStatus.CANCELLED)
      when(orderMock.executionData).thenReturn({ partiallyFilled: true } as any)

      const result = getResult()

      expect(result.title).toBe('Partially Filled')
      expect(result.color).toBe('success')
    })
  })

  describe('When order is NOT in confirmed state', () => {
    it('Then should display isCancelling state', () => {
      when(orderMock.status).thenReturn(OrderStatus.PENDING)
      when(orderMock.isCancelling).thenReturn(true)

      const result = getResult()

      expect(result.title).toBe('Cancelling...')
      expect(result.color).toBe('text1')
    })

    it('Then should NOT display partiallyFilled state', () => {
      when(orderMock.status).thenReturn(OrderStatus.PENDING)
      when(orderMock.executionData).thenReturn({ partiallyFilled: true } as any)
      when(orderMock.isCancelling).thenReturn(false)

      const result = getResult()

      expect(result.title).toBe('Open')
      expect(result.color).toBe('text3')
    })
  })
})
