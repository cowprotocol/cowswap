import { ReactNode } from 'react'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { AMOUNT_OF_ORDERS_TO_FETCH } from '@cowprotocol/common-const'

import { render, screen } from '@testing-library/react'
import { TabOrderTypes } from 'entities/routes/routes.atom'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/macro'
import { getCowswapTheme } from 'theme'

import { useLoadMoreOrders } from 'modules/orders'

import { LoadMoreOrdersSection } from './LoadMoreOrdersSection'

// Mocked without requireActual: the real barrel pulls in a graph that circles back through
// modules/ordersTable into this component, which leaves the mocked hook unconfigured.
jest.mock('modules/orders', () => ({
  useLoadMoreOrders: jest.fn(),
}))

const mockUseLoadMoreOrders = useLoadMoreOrders as jest.MockedFunction<typeof useLoadMoreOrders>

function renderWithLocale(locale: string, ui: ReactNode): ReturnType<typeof render> {
  i18n.activate(locale)

  return render(
    <I18nProvider i18n={i18n}>
      <StyledComponentsThemeProvider theme={getCowswapTheme(false)}>{ui}</StyledComponentsThemeProvider>
    </I18nProvider>,
  )
}

describe('LoadMoreOrdersSection', () => {
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

  beforeEach(() => {
    i18n.load('en-US', {})

    mockUseLoadMoreOrders.mockReturnValue({
      limit: 50,
      hasMoreOrders: true,
      isLoading: false,
      loadMore: jest.fn(),
    })
  })

  afterEach(() => {
    i18n.activate('en-US')
  })

  it.each([
    [1, 'Found 1 open order in the 50 most recent ones.'],
    [5, 'Found 5 open orders in the 50 most recent ones.'],
    // Whether the catalog can express the Russian one/few/many forms is asserted in
    // src/i18n.catalog.test.ts - it is a property of the extracted message, not of the DOM.
  ])('selects the plural form for %i open orders', (totalOpenOrders, expected) => {
    renderWithLocale(
      'en-US',
      <LoadMoreOrdersSection totalOpenOrders={totalOpenOrders} orderType={TabOrderTypes.SWAP} />,
    )

    expect(screen.getByText(expected)).toBeTruthy()
  })

  it('renders initial limit message when limit equals AMOUNT_OF_ORDERS_TO_FETCH', () => {
    mockUseLoadMoreOrders.mockReturnValue({
      limit: AMOUNT_OF_ORDERS_TO_FETCH,
      hasMoreOrders: true,
      isLoading: false,
      loadMore: jest.fn(),
    })

    renderWithLocale('en-US', <LoadMoreOrdersSection totalOpenOrders={10} orderType={TabOrderTypes.SWAP} />)

    expect(screen.getByText(`Only the ${AMOUNT_OF_ORDERS_TO_FETCH} most recent orders were searched.`)).toBeTruthy()
  })

  it('renders that all orders are loaded when hasMoreOrders is false', () => {
    mockUseLoadMoreOrders.mockReturnValue({
      limit: 50,
      hasMoreOrders: false,
      isLoading: false,
      loadMore: jest.fn(),
    })

    renderWithLocale('en-US', <LoadMoreOrdersSection totalOpenOrders={5} orderType={TabOrderTypes.SWAP} />)

    expect(screen.getByText("That's all your open orders.")).toBeTruthy()
  })
})
