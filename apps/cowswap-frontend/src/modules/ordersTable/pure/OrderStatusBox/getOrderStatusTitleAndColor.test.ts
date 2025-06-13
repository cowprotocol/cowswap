import { UI } from '@cowprotocol/ui'

import { instance, mock, when } from 'ts-mockito'

import { OrderStatus } from 'legacy/state/orders/actions'

import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import { getOrderStatusTitleAndColor } from './getOrderStatusTitleAndColor'

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
describe('getOrderStatusTitleAndColor()', () => {
  let orderMock: ParsedOrder

  beforeEach(() => {
    orderMock = mock<ParsedOrder>()
  })

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const getResult = () => getOrderStatusTitleAndColor(instance(orderMock))

  describe('Order Status and Colors', () => {
    // Test for fulfilled orders
    it('should return correct title and colors for a fulfilled order', () => {
      when(orderMock.status).thenReturn(OrderStatus.FULFILLED)
      const result = getResult()
      expect(result.title).toBe('Filled')
      expect(result.color).toBe(`var(${UI.COLOR_SUCCESS_TEXT})`)
      expect(result.background).toBe(`var(${UI.COLOR_SUCCESS_BG})`)
    })

    // Test for expired orders
    it('should return correct title and colors for an expired order', () => {
      when(orderMock.status).thenReturn(OrderStatus.EXPIRED)
      const result = getResult()
      expect(result.title).toBe('Expired')
      expect(result.color).toBe(`var(${UI.COLOR_ALERT_TEXT})`)
      expect(result.background).toBe(`var(${UI.COLOR_ALERT_BG})`)
    })

    // Test for cancelling orders
    it('should handle cancelling orders correctly', () => {
      when(orderMock.status).thenReturn(OrderStatus.PENDING)
      when(orderMock.isCancelling).thenReturn(true)
      const result = getResult()
      expect(result.title).toBe('Cancelling...')
      expect(result.color).toBe(`var(${UI.COLOR_DANGER_TEXT})`)
      expect(result.background).toBe(`var(${UI.COLOR_DANGER_BG})`)
    })

    it('should return correct title and colors for a cancelled order', () => {
      when(orderMock.status).thenReturn(OrderStatus.CANCELLED)
      const result = getResult()
      expect(result.title).toBe('Cancelled')
      expect(result.color).toBe(`var(${UI.COLOR_DANGER_TEXT})`)
      expect(result.background).toBe(`var(${UI.COLOR_DANGER_BG})`)
    })

    it('should handle orders in failed state correctly', () => {
      when(orderMock.status).thenReturn(OrderStatus.FAILED)
      const result = getResult()
      expect(result.title).toBe('Failed')
      expect(result.color).toBe(`var(${UI.COLOR_DANGER_TEXT})`)
      expect(result.background).toBe(`var(${UI.COLOR_DANGER_BG})`)
    })

    it('Then should display partiallyFilled state', () => {
      when(orderMock.status).thenReturn(OrderStatus.CANCELLED)
      // TODO: Replace any with proper type definitions
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      when(orderMock.executionData).thenReturn({ partiallyFilled: true } as any)

      const result = getResult()

      expect(result.title).toBe('Partially Filled')
      expect(result.color).toBe(`var(${UI.COLOR_SUCCESS_TEXT})`)
      expect(result.background).toBe(`var(${UI.COLOR_SUCCESS_BG})`)
    })
  })
})
