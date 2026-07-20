import { render, screen } from '@testing-library/react'

import { OrderStatus } from 'legacy/state/orders/actions'

import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import { TwapOrderStatus } from './TwapOrderStatus.pure'

jest.mock('react-inlinesvg', () => {
  return function MockSvg() {
    return <svg />
  }
})

beforeAll(() => {
  window.matchMedia =
    window.matchMedia ||
    (() =>
      ({
        matches: false,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        addListener: () => undefined,
        removeListener: () => undefined,
      }) as unknown as MediaQueryList)
})

function childOrder(overrides: Partial<ParsedOrder>): ParsedOrder {
  return {
    status: OrderStatus.SCHEDULED,
    executionData: { filledPercentDisplay: '0' },
    ...overrides,
  } as unknown as ParsedOrder
}

describe('TwapOrderStatus()', () => {
  it('shows the "Update fallback handler" reason when the handler is broken and a part is open', () => {
    render(
      <TwapOrderStatus
        orderStatus={OrderStatus.PENDING}
        isFallbackHandlerBroken={true}
        childOrders={[childOrder({ status: OrderStatus.PENDING })]}
      >
        fallback children
      </TwapOrderStatus>,
    )

    expect(screen.getByText('Update fallback handler')).not.toBeNull()
    expect(screen.queryByText('fallback children')).toBeNull()
  })

  it('renders the passed children when the fallback handler is not broken', () => {
    render(
      <TwapOrderStatus
        orderStatus={OrderStatus.PENDING}
        isFallbackHandlerBroken={false}
        childOrders={[childOrder({ status: OrderStatus.PENDING })]}
      >
        fallback children
      </TwapOrderStatus>,
    )

    expect(screen.queryByText('Update fallback handler')).toBeNull()
    expect(screen.getByText('fallback children')).not.toBeNull()
  })
})
