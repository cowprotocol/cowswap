import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { fireEvent, render, screen } from '@testing-library/react'
import { OrderTabId } from 'entities/routes/routes.atom'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/macro'
import { getCowswapTheme } from 'theme'

import { MobileOrdersFilterSheet } from './MobileOrdersFilterSheet.pure'

import { ordersTableStateAtom } from '../../state/ordersTable.atoms'
import { ordersTableTabIdAtom } from '../../state/params/ordersTableParams.atom'
import { HistoryStatusFilter } from '../../utils/getFilteredOrders'

const mockUseAtomValue = jest.fn()

jest.mock('jotai', () => ({
  ...jest.requireActual('jotai'),
  useAtomValue: (...args: unknown[]) => mockUseAtomValue(...args),
}))

i18n.load('en-US', {})
i18n.activate('en-US')

function renderFilterSheet(historyStatusFilter = HistoryStatusFilter.ALL, searchTerm = ''): ReturnType<typeof render> {
  mockUseAtomValue.mockImplementation((atom: unknown) => {
    if (atom === ordersTableStateAtom) return { orders: [] }
    if (atom === ordersTableTabIdAtom) return OrderTabId.HISTORY

    return undefined
  })

  return render(
    <I18nProvider i18n={i18n}>
      <StyledComponentsThemeProvider theme={getCowswapTheme(false)}>
        <MobileOrdersFilterSheet
          isOpen
          searchTerm={searchTerm}
          historyStatusFilter={historyStatusFilter}
          onOpenChange={jest.fn()}
          onApply={jest.fn()}
        />
      </StyledComponentsThemeProvider>
    </I18nProvider>,
  )
}

describe('MobileOrdersFilterSheet', () => {
  beforeEach(() => {
    // BottomDrawer → useBodyScrollbarLocker → useMediaQuery
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      })),
    })
  })

  it('disables Reset at defaults and enables it for an applied filter', () => {
    const { unmount } = renderFilterSheet()

    expect(screen.getByRole('button', { name: 'Reset filters' }).hasAttribute('disabled')).toBe(true)
    unmount()

    renderFilterSheet(HistoryStatusFilter.FILLED)
    expect(screen.getByRole('button', { name: 'Reset filters' }).hasAttribute('disabled')).toBe(false)
  })

  it('offers a distinct partially-filled filter with wrapping touch targets', () => {
    renderFilterSheet()

    const partiallyFilled = screen.getByRole('button', { name: 'Partially filled' })
    const statusLegend = screen.getByText('Status')
    const choices = partiallyFilled.parentElement
    const group = choices?.parentElement

    expect(choices).not.toBeNull()
    expect(group).not.toBeNull()
    expect(getComputedStyle(choices as HTMLElement).flexWrap).toBe('wrap')
    expect(getComputedStyle(group as HTMLElement).gap).toBe('12px')
    expect(getComputedStyle(statusLegend).marginBottom).toBe('12px')
    expect(getComputedStyle(partiallyFilled).minHeight).toBe('44px')

    fireEvent.click(partiallyFilled)
    expect(screen.getByRole('button', { name: 'Reset filters' }).hasAttribute('disabled')).toBe(false)
  })
})
