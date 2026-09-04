import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/macro'
import { getCowswapTheme } from 'theme'

import { OrdersTablePagination } from './OrdersTablePagination.pure'

i18n.load('en-US', {})
i18n.activate('en-US')

describe('OrdersTablePagination', () => {
  it('exposes page navigation semantics', () => {
    render(
      <MemoryRouter>
        <I18nProvider i18n={i18n}>
          <StyledComponentsThemeProvider theme={getCowswapTheme(false)}>
            <OrdersTablePagination
              currentPage={1}
              pageSize={10}
              totalCount={13}
              getPageUrl={(page) => ({ search: `?page=${page}` })}
            />
          </StyledComponentsThemeProvider>
        </I18nProvider>
      </MemoryRouter>,
    )

    const currentPage = screen.getByRole('link', { name: 'Page 1' })

    expect(screen.getByRole('navigation', { name: 'Orders pages' })).not.toBeNull()
    expect(currentPage.getAttribute('aria-current')).toBe('page')
    expect(screen.getByRole('link', { name: 'Go to page 2' })).not.toBeNull()
  })

  it('omits ellipses when the batch and boundary pages cover every page (15 pages, page 8)', () => {
    render(
      <MemoryRouter>
        <I18nProvider i18n={i18n}>
          <StyledComponentsThemeProvider theme={getCowswapTheme(false)}>
            <OrdersTablePagination
              currentPage={8}
              pageSize={10}
              totalCount={150}
              getPageUrl={(page) => ({ search: `?page=${page}` })}
            />
          </StyledComponentsThemeProvider>
        </I18nProvider>
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Page 8' })).not.toBeNull()
    expect(screen.getAllByRole('link', { name: 'Go to page 15' })).toHaveLength(1)
    expect(screen.queryAllByText('...')).toHaveLength(0)

    const numberedPages = screen
      .getAllByRole('link')
      .map((link) => link.textContent)
      .filter((text): text is string => text !== null && /^\d+$/.test(text))

    expect(numberedPages).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'])
  })
})
