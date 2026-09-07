import { createStore, Provider } from 'jotai'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { fireEvent, render, screen } from '@testing-library/react'
import { twapOrdersAtom } from 'entities/twap'

import { OrderStatus } from 'legacy/state/orders/actions'

import type { TwapOrderItem } from 'modules/twap'

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

function getTwapOrderWithPartCount(parent: ParsedOrder, partCount: number): TwapOrderItem {
  return {
    id: parent.id,
    chainId: SupportedChainId.GNOSIS_CHAIN,
    safeAddress: parent.owner,
    resolvedOwner: parent.owner,
    status: 'Pending' as TwapOrderItem['status'],
    submissionDate: new Date(0).toISOString(),
    order: {
      sellToken: parent.inputToken.address,
      buyToken: parent.outputToken.address,
      receiver: parent.owner,
      partSellAmount: parent.sellAmount,
      minPartLimit: parent.buyAmount,
      t0: 0,
      n: partCount,
      t: 60,
      span: 0,
      appData: '',
    },
    executionInfo: {
      confirmedPartsCount: 0,
      info: { executedSellAmount: '0', executedBuyAmount: '0', executedFeeAmount: '0' },
    },
  }
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

function renderCard(
  order: OrderTableItem,
  onOpen: () => void = jest.fn(),
  warningReason?: WarningReason,
  store = createStore(),
): void {
  render(
    <Provider store={store}>
      <I18nProvider i18n={i18n}>
        <MobileOrderCard item={order} warningReason={warningReason} onOpen={onOpen} />
      </I18nProvider>
    </Provider>,
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
    expect(screen.getByText('Execution price')).not.toBeNull()
    expect(screen.queryByText('Limit price')).toBeNull()
  })

  it('renders the price before fill outcome inside the intended summary surface', () => {
    renderCard(orderWithFillPercentage('64'))

    const priceLabel = screen.getByText('Execution price')
    const fillLabel = screen.getByText('Fill outcome')
    const priceRow = priceLabel.parentElement
    const fillRow = fillLabel.parentElement
    const summary = priceRow?.parentElement

    expect(priceRow).not.toBeNull()
    expect(fillRow).not.toBeNull()
    expect(summary).not.toBeNull()

    const rows = Array.from(summary?.children ?? [])

    expect(rows.indexOf(priceRow as HTMLElement)).toBeLessThan(rows.indexOf(fillRow as HTMLElement))

    const summaryStyle = getComputedStyle(summary as HTMLElement)

    expect(summaryStyle.borderRadius).toBe('16px')
    expect(summaryStyle.overflow).toBe('hidden')
    expect(summaryStyle.paddingLeft).toBe('12px')
    expect(summaryStyle.paddingRight).toBe('12px')
    expect(priceLabel.getAttribute('aria-label')).toBe('Avg. execution price')

    for (const label of [priceLabel, fillLabel]) {
      const labelStyle = getComputedStyle(label)

      expect(labelStyle.textTransform).toBe('uppercase')
      expect(labelStyle.fontWeight).toBe('600')
    }

    expect(getComputedStyle(screen.getByRole('progressbar')).height).toBe('6px')
  })

  it('does not round a tiny positive fill down to zero', () => {
    renderCard(orderWithFillPercentage('0.004'))

    expect(screen.getByText('<0.01%')).not.toBeNull()
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('0.004')
  })

  it('shows the limit price for an open order', () => {
    renderCard(orderWithFillPercentage('0'))

    expect(screen.queryByText('Fill outcome')).toBeNull()
    expect(screen.queryByRole('progressbar')).toBeNull()
    expect(screen.getByText('Limit price')).not.toBeNull()
    expect(screen.queryByText('Execution price')).toBeNull()
  })

  it('prioritizes average execution price for a filled order', () => {
    renderCard(orderWithFillPercentage('100'))

    expect(screen.getByText('Execution price')).not.toBeNull()
    expect(screen.queryByText('Fill outcome')).toBeNull()
    expect(screen.queryByText('Limit price')).toBeNull()
  })

  it.each([
    { warningReason: WarningReason.Balance, warningLabel: 'Insufficient balance' },
    { warningReason: WarningReason.Allowance, warningLabel: 'Insufficient allowance' },
    { warningReason: WarningReason.FallbackHandler, warningLabel: 'Update fallback handler' },
  ])(
    'keeps partial-fill progress but hides prices when action is required: $warningLabel',
    ({ warningReason, warningLabel }) => {
      renderCard(orderWithFillPercentage('64'), jest.fn(), warningReason)

      expect(screen.getAllByText('Action required')).toHaveLength(2)
      expect(screen.getByText(warningLabel)).not.toBeNull()
      expect(screen.getByText('Fill outcome')).not.toBeNull()
      expect(screen.getByText('64%')).not.toBeNull()
      expect(screen.queryByText('Execution price')).toBeNull()
      expect(screen.queryByText('Limit price')).toBeNull()
    },
  )

  it.each(['64', '100'])('falls back to limit price and progress for a %s%% fill without execution price', (fill) => {
    const order = orderWithFillPercentage(fill)

    renderCard({
      ...order,
      executionData: { ...order.executionData, executedPrice: null },
    })

    expect(screen.getByText('Limit price')).not.toBeNull()
    expect(screen.getByText('Fill outcome')).not.toBeNull()
    expect(screen.getByText(`${fill}%`)).not.toBeNull()
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe(fill)
    expect(screen.queryByText('Execution price')).toBeNull()
  })

  it('does not present execution data for an ungrouped EOA TWAP parent', () => {
    renderCard({ ...orderWithFillPercentage('64'), isEoaTwapOrder: true })

    expect(screen.getByText('Limit price')).not.toBeNull()
    expect(screen.queryByText('Execution price')).toBeNull()
    expect(screen.queryByText('Fill outcome')).toBeNull()
    expect(screen.queryByRole('progressbar')).toBeNull()
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

  it('uses the authoritative TWAP schedule part count instead of the loaded child count', () => {
    const parent = orderWithFillPercentage('0')
    const child = { ...parent, id: `${parent.id}-part` }
    const store = createStore()

    store.set(twapOrdersAtom, { [parent.id]: getTwapOrderWithPartCount(parent, 10) })
    renderCard({ parent, children: [child, { ...child, id: `${child.id}-2` }] }, jest.fn(), undefined, store)

    expect(screen.getByText('TWAP · 10 parts')).not.toBeNull()
    expect(screen.queryByText('TWAP · 2 parts')).toBeNull()
  })

  it('does not present parent-level TWAP execution data as an aggregated outcome', () => {
    const parent = { ...orderWithFillPercentage('100'), isEoaTwapOrder: true }
    const child = { ...parent, id: `${parent.id}-part`, isEoaTwapOrder: false }

    renderCard({ parent, children: [child] })

    expect(screen.getByText('Limit price')).not.toBeNull()
    expect(screen.queryByText('Execution price')).toBeNull()
    expect(screen.queryByText('Fill outcome')).toBeNull()
  })

  it('uses the fulfillment time for a filled order and includes the year for older events', () => {
    renderCard({
      ...orderWithFillPercentage('100'),
      fulfillmentTime: '2022-11-11T13:24:00.000Z',
    })

    expect(screen.getByText(/^Filled .*2022/)).not.toBeNull()
  })

  it('uses the fulfillment time when executionData.fullyFilled is true even if status is not FULFILLED', () => {
    const order = orderWithFillPercentage('100')

    renderCard({
      ...order,
      status: OrderStatus.EXPIRED,
      fulfillmentTime: '2022-11-11T13:24:00.000Z',
      executionData: { ...order.executionData, fullyFilled: true },
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
