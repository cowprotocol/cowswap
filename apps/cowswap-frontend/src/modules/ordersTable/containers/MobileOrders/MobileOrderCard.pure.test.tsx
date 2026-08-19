import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { fireEvent, render, screen } from '@testing-library/react'

import { OrderStatus } from 'legacy/state/orders/actions'

import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import { MobileOrderCard } from './MobileOrderCard.pure'

import { WarningReason } from '../../pure/OrderEstimatedExecutionPrice/orderEstimatedExecutionPrice.constants'
import { OrderTableItem } from '../../state/ordersTable.types'
import { ordersMock } from '../../test/ordersTable.mock'

jest.mock('common/pure/CurrencyLogoPair', () => ({
  CurrencyLogoPair: ({ tokenSize }: { tokenSize: number }) => (
    <span data-testid="currency-logo-pair" data-token-size={tokenSize} />
  ),
}))

i18n.load('en-US', {})
i18n.activate('en-US')

function getBaseOrder(): ParsedOrder {
  const order = ordersMock.find(({ id }) => id === '4')

  if (!order) throw new Error('Expected fulfilled order mock')

  return order
}

function orderWithFillPercentage(filledPercentDisplay: string): ParsedOrder {
  const order = getBaseOrder()
  const fillPercentage = Number(filledPercentDisplay)

  return {
    ...order,
    status:
      fillPercentage === 100 ? OrderStatus.FULFILLED : fillPercentage > 0 ? OrderStatus.EXPIRED : OrderStatus.PENDING,
    executionData: {
      ...order.executionData,
      filledPercentDisplay,
      fullyFilled: fillPercentage === 100,
      partiallyFilled: fillPercentage > 0 && fillPercentage < 100,
    },
  }
}

function renderCard(order: OrderTableItem, onOpen: () => void = jest.fn(), warningReason?: WarningReason): void {
  render(
    <I18nProvider i18n={i18n}>
      <MobileOrderCard item={order} warningReason={warningReason} onOpen={onOpen} />
    </I18nProvider>,
  )
}

describe('MobileOrderCard', () => {
  it('renders the token pair at 36px', () => {
    renderCard(orderWithFillPercentage('0'))

    expect(screen.getByTestId('currency-logo-pair').getAttribute('data-token-size')).toBe('36')
  })

  it('uses compact 10px card padding', () => {
    renderCard(orderWithFillPercentage('0'))

    expect(getComputedStyle(screen.getByRole('button', { name: /View order .* to .*/ })).padding).toBe('10px')
  })

  it('labels the sell and buy amounts explicitly', () => {
    renderCard(orderWithFillPercentage('0'))

    const sellLabel = screen.getByText('Sell')
    const amounts = sellLabel.parentElement?.parentElement

    expect(sellLabel).not.toBeNull()
    expect(screen.getByText('Buy')).not.toBeNull()
    expect(amounts).not.toBeNull()
    expect(getComputedStyle(amounts as HTMLElement).gridTemplateColumns).toBe('max-content minmax(0,1fr)')
    expect(getComputedStyle(sellLabel.parentElement as HTMLElement).display).toBe('contents')
    expect(getComputedStyle(sellLabel.nextElementSibling as HTMLElement).fontSize).toBe('14px')
  })

  it('opens the order receipt when the card is clicked', () => {
    const onOpen = jest.fn()

    renderCard(orderWithFillPercentage('64'), onOpen)
    fireEvent.click(screen.getByRole('button', { name: /View order .* to .*/ }))

    expect(onOpen).toHaveBeenCalledTimes(1)
  })

  it('shows fill progress and average execution price for a partially filled order', () => {
    renderCard(orderWithFillPercentage('64'))

    expect(screen.getByText('Fill outcome')).not.toBeNull()
    expect(screen.getByText('64%')).not.toBeNull()
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('64')
    expect(screen.getByText('Avg. execution price')).not.toBeNull()
    expect(screen.queryByText('Limit price')).toBeNull()
  })

  it('shows the limit price for an open order', () => {
    renderCard(orderWithFillPercentage('0'))

    expect(screen.queryByText('Fill outcome')).toBeNull()
    expect(screen.queryByRole('progressbar')).toBeNull()
    expect(screen.getByText('Limit price')).not.toBeNull()
    expect(screen.queryByText('Avg. execution price')).toBeNull()
  })

  it('prioritizes average execution price for a filled order', () => {
    renderCard(orderWithFillPercentage('100'))

    expect(screen.getByText('Avg. execution price')).not.toBeNull()
    expect(screen.queryByText('Fill outcome')).toBeNull()
    expect(screen.queryByText('Limit price')).toBeNull()
  })

  it('shows a not-filled outcome with the original limit for an expired order without fills', () => {
    const order = orderWithFillPercentage('0')

    renderCard({
      ...order,
      status: OrderStatus.EXPIRED,
      executionData: { ...order.executionData, executedPrice: null },
    })

    expect(screen.getByText('Not filled')).not.toBeNull()
    expect(screen.getByText('Limit price')).not.toBeNull()
  })

  it('identifies grouped TWAP programs and surfaces action-required status', () => {
    const parent = orderWithFillPercentage('0')
    const child = { ...parent, id: `${parent.id}-part` }

    renderCard({ parent, children: [child, { ...child, id: `${child.id}-2` }] }, jest.fn(), WarningReason.Balance)

    expect(screen.getByText('TWAP · 2 parts')).not.toBeNull()
    expect(screen.getAllByText('Action required')).toHaveLength(2)
    expect(screen.getByText('Insufficient balance')).not.toBeNull()
  })

  it('does not present parent-level TWAP execution data as an aggregated outcome', () => {
    const parent = { ...orderWithFillPercentage('100'), isEoaTwapOrder: true }
    const child = { ...parent, id: `${parent.id}-part`, isEoaTwapOrder: false }

    renderCard({ parent, children: [child] })

    expect(screen.getByText('Limit price')).not.toBeNull()
    expect(screen.queryByText('Avg. execution price')).toBeNull()
    expect(screen.queryByText('Fill outcome')).toBeNull()
  })

  it('uses the fulfillment time for a filled order and includes the year for older events', () => {
    renderCard({
      ...orderWithFillPercentage('100'),
      fulfillmentTime: '2022-11-11T13:24:00.000Z',
    })

    expect(screen.getByText(/^Filled .*2022/)).not.toBeNull()
  })

  it('uses the expiry time for an expired order', () => {
    const order = orderWithFillPercentage('0')

    renderCard({
      ...order,
      status: OrderStatus.EXPIRED,
      expirationTime: new Date('2022-11-12T20:00:00.000Z'),
      executionData: { ...order.executionData, executedPrice: null },
    })

    expect(screen.getByText(/^Expired .*2022/)).not.toBeNull()
  })

  it('falls back to the creation time when a cancellation time is unavailable', () => {
    const order = orderWithFillPercentage('0')

    renderCard({
      ...order,
      status: OrderStatus.CANCELLED,
      executionData: { ...order.executionData, executedPrice: null },
    })

    expect(screen.getByText(/^Created .*2022/)).not.toBeNull()
  })
})
