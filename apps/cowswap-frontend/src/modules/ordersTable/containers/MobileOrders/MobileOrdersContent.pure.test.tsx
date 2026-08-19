import { ReactElement } from 'react'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { render, screen } from '@testing-library/react'
import { OrderTabId, TabOrderTypes } from 'entities/routes/routes.atom'
import { MemoryRouter } from 'react-router'

import { MobileOrdersContent } from './MobileOrdersContent.pure'

import {
  ordersTablePageAtom,
  ordersTableTabIdAtom,
  ordersTableTabsAtom,
} from '../../state/params/ordersTableParams.atom'

const mockUseAtomValue = jest.fn()

jest.mock('jotai', () => ({
  ...jest.requireActual('jotai'),
  useAtomValue: (...args: unknown[]) => mockUseAtomValue(...args),
}))

jest.mock('../../hooks/url/useGetBuildOrdersTableUrl', () => ({
  useGetBuildOrdersTableUrl: () => () => '/',
}))

jest.mock('../../hooks/useShouldDisplayProtocolFeeBanner', () => ({
  useShouldDisplayProtocolFeeBanner: () => false,
}))

jest.mock('./FiltersButton.pure', () => ({
  FiltersButton: () => <button type="button">Filters</button>,
}))

jest.mock('./MobileOrdersList.pure', () => ({
  MobileOrdersList: () => null,
}))

i18n.load('en-US', {})
i18n.activate('en-US')

describe('MobileOrdersContent', () => {
  it('shows counts for both persistent tabs, including zero open orders', () => {
    mockUseAtomValue
      .mockReturnValueOnce([
        { id: OrderTabId.OPEN, title: 'Open', count: 0 },
        { id: OrderTabId.HISTORY, title: 'Orders history', count: 0 },
      ])
      .mockReturnValueOnce(OrderTabId.OPEN)
      .mockReturnValueOnce(1)

    render(
      <MemoryRouter>
        <I18nProvider i18n={i18n}>
          <MobileOrdersContent
            orderType={TabOrderTypes.LIMIT}
            activeFilterCount={0}
            hasActiveFilters={false}
            onClose={jest.fn()}
            onHeaderFilterVisibilityChange={jest.fn()}
            onOpenFilters={jest.fn()}
            onResetFilters={jest.fn()}
          />
        </I18nProvider>
      </MemoryRouter>,
    )

    expect(screen.getByRole('tab', { name: 'Open (0)' })).not.toBeNull()
    expect(screen.getByRole('tab', { name: 'History (0)' })).not.toBeNull()
  })

  it('resets the drawer scroll position when the page changes, but not on initial mount', () => {
    const tabs = [
      { id: OrderTabId.OPEN, title: 'Open', count: 20 },
      { id: OrderTabId.HISTORY, title: 'Orders history', count: 0 },
    ]
    let currentPage = 1

    mockUseAtomValue.mockImplementation((atom: unknown) => {
      if (atom === ordersTableTabsAtom) return tabs
      if (atom === ordersTableTabIdAtom) return OrderTabId.OPEN
      if (atom === ordersTablePageAtom) return currentPage

      return undefined
    })

    const getContent = (): ReactElement => (
      <MemoryRouter>
        <I18nProvider i18n={i18n}>
          <MobileOrdersContent
            orderType={TabOrderTypes.LIMIT}
            activeFilterCount={0}
            hasActiveFilters={false}
            onClose={jest.fn()}
            onHeaderFilterVisibilityChange={jest.fn()}
            onOpenFilters={jest.fn()}
            onResetFilters={jest.fn()}
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
