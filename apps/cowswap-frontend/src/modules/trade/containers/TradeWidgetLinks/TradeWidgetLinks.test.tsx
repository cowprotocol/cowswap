import type { ReactNode } from 'react'

import { render, screen } from '@testing-library/react'
import { useLocation } from 'react-router'

import { useInjectedWidgetParams } from 'modules/injectedWidget'

import { useMenuItems } from 'common/hooks/useMenuItems'

import { useGetTradeUrlParams } from '../../hooks/useGetTradeUrlParams'
import { useTradeRouteContext } from '../../hooks/useTradeRouteContext'
import { useGetTradeStateByRoute } from '../../hooks/useTradeState'
import { addChainIdToRoute, parameterizeTradeRoute } from '../../utils/parameterizeTradeRoute'

import { TradeWidgetLinks } from './index'

const MOCK_ROUTES = {
  SWAP: '/swap',
  LIMIT_ORDERS: '/limit-orders',
  ADVANCED_ORDERS: '/advanced-orders',
  YIELD: '/yield',
}

jest.mock('common/constants/routes', () => ({
  Routes: {
    SWAP: '/swap',
    LIMIT_ORDERS: '/limit-orders',
    ADVANCED_ORDERS: '/advanced-orders',
    YIELD: '/yield',
  },
}))

interface LinkProps {
  children: ReactNode
  to: string
}

interface StyledProps {
  children: ReactNode
}

interface MenuItemProps extends StyledProps {
  onClick?: () => void
}

jest.mock('@cowprotocol/ui', () => ({
  Badge: ({ children }: StyledProps) => <span>{children}</span>,
  BadgeTypes: {
    NEUTRAL: 'NEUTRAL',
  },
  ModalHeader: ({ children }: StyledProps) => <div>{children}</div>,
}))

jest.mock('./styled', () => ({
  Link: ({ to, children }: LinkProps) => <a href={to}>{children}</a>,
  DropdownButton: ({ children }: StyledProps) => <div>{children}</div>,
  MenuItem: ({ children, onClick }: MenuItemProps) => <div onClick={onClick}>{children}</div>,
  SelectMenu: ({ children }: StyledProps) => <div>{children}</div>,
  TradeWidgetContent: ({ children }: StyledProps) => <div>{children}</div>,
  Wrapper: ({ children }: StyledProps) => <div>{children}</div>,
}))

jest.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: StyledProps) => children,
  useLingui: () => ({
    t: (template: TemplateStringsArray) => template[0],
  }),
}))

jest.mock('@lingui/react', () => ({
  Trans: ({ children }: StyledProps) => children,
  useLingui: () => ({
    t: (template: TemplateStringsArray) => template[0],
  }),
}))

jest.mock('react-router', () => ({
  useLocation: jest.fn(),
}))

jest.mock('modules/injectedWidget', () => ({
  useInjectedWidgetParams: jest.fn(),
}))

jest.mock('common/hooks/useMenuItems', () => ({
  useMenuItems: jest.fn(),
}))

jest.mock('../../hooks/useGetTradeUrlParams', () => ({
  useGetTradeUrlParams: jest.fn(),
}))

jest.mock('../../hooks/useTradeRouteContext', () => ({
  useTradeRouteContext: jest.fn(),
}))

jest.mock('../../hooks/useTradeState', () => ({
  useGetTradeStateByRoute: jest.fn(),
}))

jest.mock('../../utils/parameterizeTradeRoute', () => ({
  addChainIdToRoute: jest.fn(),
  parameterizeTradeRoute: jest.fn(),
}))

const useLocationMock = useLocation as jest.MockedFunction<typeof useLocation>
const useInjectedWidgetParamsMock = useInjectedWidgetParams as jest.MockedFunction<typeof useInjectedWidgetParams>
const useMenuItemsMock = useMenuItems as jest.MockedFunction<typeof useMenuItems>
const useGetTradeUrlParamsMock = useGetTradeUrlParams as jest.MockedFunction<typeof useGetTradeUrlParams>
const useTradeRouteContextMock = useTradeRouteContext as jest.MockedFunction<typeof useTradeRouteContext>
const useGetTradeStateByRouteMock = useGetTradeStateByRoute as jest.MockedFunction<typeof useGetTradeStateByRoute>
const addChainIdToRouteMock = addChainIdToRoute as jest.MockedFunction<typeof addChainIdToRoute>
const parameterizeTradeRouteMock = parameterizeTradeRoute as jest.MockedFunction<typeof parameterizeTradeRoute>

describe('TradeWidgetLinks', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    useInjectedWidgetParamsMock.mockReturnValue({} as never)
    useMenuItemsMock.mockReturnValue([
      { route: MOCK_ROUTES.SWAP, label: 'Swap' },
      { route: MOCK_ROUTES.LIMIT_ORDERS, label: 'Limit' },
    ] as never)
    useTradeRouteContextMock.mockReturnValue({ chainId: 1 } as never)
    useGetTradeStateByRouteMock.mockReturnValue(
      () =>
        ({
          inputCurrencyId: null,
          outputCurrencyId: null,
        }) as never,
    )
    useGetTradeUrlParamsMock.mockReturnValue(
      () =>
        ({
          chainId: 1,
          inputCurrencyId: 'ETH',
          outputCurrencyId: 'USDC',
        }) as never,
    )
    addChainIdToRouteMock.mockImplementation((route) => route)
  })

  it('preserves palette and theme widget params when generating trade links', () => {
    const paletteParam = '%7B%22paper%22%3A%22%23fffcba%22%7D'

    useLocationMock.mockReturnValue({
      pathname: MOCK_ROUTES.SWAP,
      search: `?palette=${paletteParam}&theme=light&foo=bar`,
    } as never)

    parameterizeTradeRouteMock.mockImplementation((_tradeUrlParams, route) => `${route}?custom=1`)

    render(<TradeWidgetLinks />)

    const limitLink = screen.getByRole('link', { name: 'Limit' })

    expect(limitLink.getAttribute('href')).toBe(
      `${MOCK_ROUTES.LIMIT_ORDERS}?custom=1&palette=${paletteParam}&theme=light`,
    )
  })

  it('does not overwrite existing palette and theme params in generated route', () => {
    useLocationMock.mockReturnValue({
      pathname: MOCK_ROUTES.SWAP,
      search: '?palette=from-search&theme=light',
    } as never)

    parameterizeTradeRouteMock.mockImplementation((_tradeUrlParams, route) => `${route}?palette=from-route&theme=dark`)

    render(<TradeWidgetLinks />)

    const limitLink = screen.getByRole('link', { name: 'Limit' })
    const linkUrl = new URL(limitLink.getAttribute('href') || '', 'https://widget.cow.fi')

    expect(linkUrl.searchParams.get('palette')).toBe('from-route')
    expect(linkUrl.searchParams.getAll('palette')).toHaveLength(1)
    expect(linkUrl.searchParams.get('theme')).toBe('dark')
    expect(linkUrl.searchParams.getAll('theme')).toHaveLength(1)
  })
})
