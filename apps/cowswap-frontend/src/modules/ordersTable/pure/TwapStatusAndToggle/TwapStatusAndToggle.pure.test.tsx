import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { render, screen } from '@testing-library/react'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/macro'
import { getCowswapTheme } from 'theme'

import { OrderStatus } from 'legacy/state/orders/actions'

import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import { TwapStatusAndToggle } from './TwapStatusAndToggle.pure'

import { OrderParams } from '../../utils/getOrderParams'

jest.mock('react-inlinesvg', () => {
  return function MockSvg() {
    return <svg />
  }
})

// The real tooltips render their copy lazily inside a hover helper, so swap them for markers
// to assert which warning the parent status badge surfaces.
jest.mock('../OrdersTable/Row/WarningTooltip/WarningTooltip.pure', () => ({
  FallbackHandlerWarningTooltip: () => <div>FALLBACK_HANDLER_WARNING</div>,
  WarningTooltip: () => <div>BALANCE_ALLOWANCE_WARNING</div>,
}))

i18n.load('en-US', {})
i18n.activate('en-US')

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

function childItem(
  status: OrderStatus,
  orderParams: Partial<OrderParams>,
): {
  order: ParsedOrder
  orderParams: OrderParams
} {
  return {
    order: { status, inputToken: { symbol: 'COW' } } as unknown as ParsedOrder,
    orderParams: orderParams as OrderParams,
  }
}

function parentOrder(overrides: Partial<ParsedOrder> = {}): ParsedOrder {
  return {
    id: '0xparent',
    status: OrderStatus.PENDING,
    isCancelling: false,
    inputToken: { symbol: 'COW' },
    executionData: { fullyFilled: false, partiallyFilled: false, filledPercentDisplay: '0' },
    ...overrides,
  } as unknown as ParsedOrder
}

function renderToggle(props: {
  parent: ParsedOrder
  isFallbackHandlerRequired?: boolean
  childOrders?: { order: ParsedOrder; orderParams: OrderParams }[]
}): void {
  render(
    <I18nProvider i18n={i18n}>
      <StyledComponentsThemeProvider theme={getCowswapTheme(false)}>
        <TwapStatusAndToggle
          parent={props.parent}
          childrenLength={props.childOrders?.length ?? 0}
          isCollapsed={true}
          isFallbackHandlerRequired={props.isFallbackHandlerRequired}
          onToggle={() => undefined}
          onClick={() => undefined}
          childOrders={props.childOrders ?? []}
          approveOrderToken={() => undefined}
        />
      </StyledComponentsThemeProvider>
    </I18nProvider>,
  )
}

describe('TwapStatusAndToggle()', () => {
  it('surfaces the fallback-handler warning on the parent badge for an open parent when the handler is reset', () => {
    renderToggle({ parent: parentOrder({ status: OrderStatus.PENDING }), isFallbackHandlerRequired: true })

    expect(screen.getByText('FALLBACK_HANDLER_WARNING')).not.toBeNull()
    expect(screen.queryByText('BALANCE_ALLOWANCE_WARNING')).toBeNull()
  })

  it('surfaces the fallback-handler warning for a scheduled parent as well', () => {
    renderToggle({ parent: parentOrder({ status: OrderStatus.SCHEDULED }), isFallbackHandlerRequired: true })

    expect(screen.getByText('FALLBACK_HANDLER_WARNING')).not.toBeNull()
  })

  it('shows no warning when the fallback handler is intact and children are healthy', () => {
    renderToggle({ parent: parentOrder({ status: OrderStatus.PENDING }), isFallbackHandlerRequired: false })

    expect(screen.queryByText('FALLBACK_HANDLER_WARNING')).toBeNull()
    expect(screen.queryByText('BALANCE_ALLOWANCE_WARNING')).toBeNull()
  })

  it('does not surface the fallback-handler warning once the parent is no longer open', () => {
    renderToggle({ parent: parentOrder({ status: OrderStatus.FULFILLED }), isFallbackHandlerRequired: true })

    expect(screen.queryByText('FALLBACK_HANDLER_WARNING')).toBeNull()
  })

  it('prefers the fallback-handler warning over a child balance/allowance warning', () => {
    renderToggle({
      parent: parentOrder({ status: OrderStatus.PENDING }),
      isFallbackHandlerRequired: true,
      childOrders: [childItem(OrderStatus.PENDING, { hasEnoughBalance: false, hasEnoughAllowance: true })],
    })

    expect(screen.getByText('FALLBACK_HANDLER_WARNING')).not.toBeNull()
    expect(screen.queryByText('BALANCE_ALLOWANCE_WARNING')).toBeNull()
  })
})
