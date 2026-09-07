import { ReactNode } from 'react'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { AMOUNT_OF_ORDERS_TO_FETCH } from '@cowprotocol/common-const'

import { act, render, screen } from '@testing-library/react'
import { TabOrderTypes } from 'entities/routes/routes.atom'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/macro'
import { getCowswapTheme } from 'theme'

import { useLoadMoreOrders } from 'modules/orders'

import { LoadMoreOrdersSection } from './LoadMoreOrdersSection'

jest.mock('modules/orders', () => ({
  ...jest.requireActual('modules/orders'),
  useLoadMoreOrders: jest.fn(),
}))

const mockUseLoadMoreOrders = useLoadMoreOrders as jest.MockedFunction<typeof useLoadMoreOrders>

function renderWithI18n(ui: ReactNode): ReturnType<typeof render> {
  return render(
    <I18nProvider i18n={i18n}>
      <StyledComponentsThemeProvider theme={getCowswapTheme(false)}>{ui}</StyledComponentsThemeProvider>
    </I18nProvider>,
  )
}

describe('LoadMoreOrdersSection', () => {
  const msgId =
    'Found {totalOpenOrders, plural, one {# open order} few {# open orders} many {# open orders} other {# open orders}} in the {limit} most recent ones.'

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
    i18n.load('en-US', {
      [msgId]:
        'Found {totalOpenOrders, plural, one {# open order} few {# open orders} many {# open orders} other {# open orders}} in the {limit} most recent ones.',
    })
    i18n.load('es-ES', {
      [msgId]:
        'Encontradas {totalOpenOrders, plural, one {# orden abierta} few {# órdenes abiertas} many {# órdenes abiertas} other {# órdenes abiertas}} en las {limit} más recientes.',
    })
    i18n.activate('en-US')
  })

  it('updates rendered translation when locale changes while component remains mounted', () => {
    mockUseLoadMoreOrders.mockReturnValue({
      limit: 50,
      hasMoreOrders: true,
      isLoading: false,
      loadMore: jest.fn(),
    })

    renderWithI18n(<LoadMoreOrdersSection totalOpenOrders={5} orderType={TabOrderTypes.SWAP} />)

    // Initial render in English
    expect(screen.getByText('Found 5 open orders in the 50 most recent ones.')).toBeTruthy()

    // Switch locale while component remains mounted
    act(() => {
      i18n.activate('es-ES')
    })

    // Component subscribed to LinguiContext updates its rendered translation
    expect(screen.getByText('Encontradas 5 órdenes abiertas en las 50 más recientes.')).toBeTruthy()
  })

  it('handles singular forms when plural count is 1', () => {
    mockUseLoadMoreOrders.mockReturnValue({
      limit: 50,
      hasMoreOrders: true,
      isLoading: false,
      loadMore: jest.fn(),
    })

    renderWithI18n(<LoadMoreOrdersSection totalOpenOrders={1} orderType={TabOrderTypes.SWAP} />)

    expect(screen.getByText('Found 1 open order in the 50 most recent ones.')).toBeTruthy()

    act(() => {
      i18n.activate('es-ES')
    })

    expect(screen.getByText('Encontradas 1 orden abierta en las 50 más recientes.')).toBeTruthy()
  })

  it('renders initial limit message when limit equals AMOUNT_OF_ORDERS_TO_FETCH', () => {
    mockUseLoadMoreOrders.mockReturnValue({
      limit: AMOUNT_OF_ORDERS_TO_FETCH,
      hasMoreOrders: true,
      isLoading: false,
      loadMore: jest.fn(),
    })

    renderWithI18n(<LoadMoreOrdersSection totalOpenOrders={10} orderType={TabOrderTypes.SWAP} />)

    expect(screen.getByText(`Only the ${AMOUNT_OF_ORDERS_TO_FETCH} most recent orders were searched.`)).toBeTruthy()
  })

  it('renders that all orders are loaded when hasMoreOrders is false', () => {
    mockUseLoadMoreOrders.mockReturnValue({
      limit: 50,
      hasMoreOrders: false,
      isLoading: false,
      loadMore: jest.fn(),
    })

    renderWithI18n(<LoadMoreOrdersSection totalOpenOrders={5} orderType={TabOrderTypes.SWAP} />)

    expect(screen.getByText("That's all your open orders.")).toBeTruthy()
  })
})
