import { ReactElement } from 'react'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { act, render, screen } from '@testing-library/react'
import { OrderTabId, TabOrderTypes } from 'entities/routes/routes.atom'
import { MemoryRouter } from 'react-router'

import { MobileOrders } from './MobileOrders.container'

import {
  ordersTablePageAtom,
  ordersTableTabIdAtom,
  ordersTableTabsAtom,
} from '../../state/params/ordersTableParams.atom'
import { HistoryStatusFilter } from '../../utils/getFilteredOrders'

const mockUseWalletInfo = jest.fn((): { account: string | undefined } => ({ account: undefined }))
const mockUseAtomValue = jest.fn()

const defaultTabs = [
  { id: OrderTabId.OPEN, title: 'Open', count: 0 },
  { id: OrderTabId.HISTORY, title: 'Orders history', count: 13 },
]

jest.mock('jotai', () => ({
  ...jest.requireActual('jotai'),
  useAtomValue: (...args: unknown[]) => mockUseAtomValue(...args),
}))

jest.mock('@cowprotocol/wallet', () => ({
  useWalletInfo: () => mockUseWalletInfo(),
}))

jest.mock('common/hooks/useIsProviderNetworkUnsupported', () => ({
  useIsProviderNetworkUnsupported: () => false,
}))

jest.mock('../../hooks/url/useGetBuildOrdersTableUrl', () => ({
  useGetBuildOrdersTableUrl: () => () => '/',
}))

jest.mock('../../pure/OrdersTable/Content/NoWallet/OrdersTableNoWalletContent', () => ({
  OrdersTableNoWalletContent: () => <div>No wallet</div>,
}))

jest.mock('./MobileOrdersFilterSheet.pure', () => ({
  MobileOrdersFilterSheet: () => null,
}))

jest.mock('./MobileOrdersContent.pure', () => ({
  MobileOrdersContent: () => <div>Orders content</div>,
}))

i18n.load('en-US', {})
i18n.activate('en-US')

class MockIntersectionObserver implements IntersectionObserver {
  readonly root = null
  readonly rootMargin = ''
  readonly thresholds: number[] = []
  readonly callback: IntersectionObserverCallback

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
    observerInstances.push(this)
  }

  disconnect(): void {}
  observe(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
  unobserve(): void {}
}

let observerInstances: MockIntersectionObserver[] = []

function mockAtoms({
  tabs = defaultTabs,
  tabId = OrderTabId.HISTORY,
  page = 1,
}: {
  tabs?: typeof defaultTabs
  tabId?: OrderTabId
  page?: number
} = {}): void {
  mockUseAtomValue.mockImplementation((atom: unknown) => {
    if (atom === ordersTableTabsAtom) return tabs
    if (atom === ordersTableTabIdAtom) return tabId
    if (atom === ordersTablePageAtom) return page

    return undefined
  })
}

function renderMobileOrders(
  orderType: TabOrderTypes = TabOrderTypes.LIMIT,
  wrapper?: (node: ReactElement) => ReactElement,
): ReturnType<typeof render> {
  const ui = (
    <MemoryRouter>
      <I18nProvider i18n={i18n}>
        <MobileOrders
          orderType={orderType}
          searchTerm=""
          historyStatusFilter={HistoryStatusFilter.ALL}
          onApplyFilters={jest.fn()}
          onResetFilters={jest.fn()}
          onClose={jest.fn()}
        />
      </I18nProvider>
    </MemoryRouter>
  )

  return render(wrapper ? wrapper(ui) : ui)
}

describe('MobileOrders', () => {
  beforeEach(() => {
    mockUseWalletInfo.mockReturnValue({ account: undefined })
    mockAtoms()
    observerInstances = []
    global.IntersectionObserver = MockIntersectionObserver
  })

  it.each([
    [TabOrderTypes.LIMIT, 'Limit orders'],
    [TabOrderTypes.ADVANCED, 'TWAP orders'],
  ])('shows the order-type title for %s', (orderType, expectedTitle) => {
    renderMobileOrders(orderType)

    expect(screen.getByText(expectedTitle)).not.toBeNull()
  })

  it('shows counts for both persistent tabs, including zero open orders', () => {
    mockUseWalletInfo.mockReturnValue({ account: '0x1234' })
    mockAtoms({
      tabs: [
        { id: OrderTabId.OPEN, title: 'Open', count: 0 },
        { id: OrderTabId.HISTORY, title: 'Orders history', count: 0 },
      ],
      tabId: OrderTabId.OPEN,
    })

    renderMobileOrders()

    expect(screen.getByRole('tab', { name: 'Open (0)' })).not.toBeNull()
    expect(screen.getByRole('tab', { name: 'History (0)' })).not.toBeNull()
  })

  it('adds the active tab context to the compact sticky header', () => {
    mockUseWalletInfo.mockReturnValue({ account: '0x1234' })

    renderMobileOrders()

    const subtitle = screen
      .getAllByText('History (13)')
      .find((node) => node.closest('header'))
      ?.closest('[aria-hidden]')

    expect(subtitle).toBeDefined()
    expect(subtitle?.getAttribute('aria-hidden')).toBe('true')

    const observer = observerInstances[0]

    if (!observer) {
      throw new Error('Expected the tab rail IntersectionObserver to be created')
    }

    act(() => {
      observer.callback([{ isIntersecting: false } as IntersectionObserverEntry], observer)
    })

    expect(subtitle?.getAttribute('aria-hidden')).toBe('false')
  })

  it('resets the drawer scroll position when the page changes, but not on initial mount', () => {
    mockUseWalletInfo.mockReturnValue({ account: '0x1234' })
    let currentPage = 1

    mockUseAtomValue.mockImplementation((atom: unknown) => {
      if (atom === ordersTableTabsAtom) return defaultTabs
      if (atom === ordersTableTabIdAtom) return OrderTabId.OPEN
      if (atom === ordersTablePageAtom) return currentPage

      return undefined
    })

    const getContent = (): ReactElement => (
      <MemoryRouter>
        <I18nProvider i18n={i18n}>
          <MobileOrders
            orderType={TabOrderTypes.LIMIT}
            searchTerm=""
            historyStatusFilter={HistoryStatusFilter.ALL}
            onApplyFilters={jest.fn()}
            onResetFilters={jest.fn()}
            onClose={jest.fn()}
          />
        </I18nProvider>
      </MemoryRouter>
    )

    const { container, rerender } = render(<div data-drawer-content>{getContent()}</div>)
    const drawerContent = container.querySelector<HTMLElement>('[data-drawer-content]')

    expect(drawerContent).not.toBeNull()
    if (!drawerContent) return

    drawerContent.scrollTop = 240
    rerender(<div data-drawer-content>{getContent()}</div>)
    expect(drawerContent.scrollTop).toBe(240)

    currentPage = 2
    rerender(<div data-drawer-content>{getContent()}</div>)
    expect(drawerContent.scrollTop).toBe(0)
  })
})
