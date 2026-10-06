import { type ReactNode } from 'react'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { render, screen, type RenderResult } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/macro'
import { getCowswapTheme } from 'theme'

import { Routes as RoutesEnum } from 'common/constants/routes'

import Account from './index'

jest.mock('modules/affiliate', () => ({
  AffiliateFeedbackButton: () => <button type="button">Give feedback</button>,
}))

jest.mock('modules/application', () => ({
  Content: ({ children }: { children: ReactNode }) => <main>{children}</main>,
  PageTitle: ({ title }: { title?: string }) => <div data-testid="page-title">{title}</div>,
  Title: ({ children, id }: { children: ReactNode; id?: string }) => <h1 id={id}>{children}</h1>,
}))

jest.mock('./Menu', () => ({
  AccountMenu: () => <nav aria-label="Account menu" />,
}))

i18n.load('en-US', {})
i18n.activate('en-US')

function renderComponent(pathname: string): RenderResult {
  return render(
    <MemoryRouter initialEntries={[pathname]}>
      <I18nProvider i18n={i18n}>
        <StyledComponentsThemeProvider theme={getCowswapTheme(false)}>
          <Routes>
            <Route path={RoutesEnum.ACCOUNT} element={<Account />}>
              <Route path="affiliate" element={<div>Affiliate page</div>} />
              <Route path="my-rewards" element={<div>My Rewards page</div>} />
              <Route path="tokens" element={<div>Tokens page</div>} />
            </Route>
            <Route path={RoutesEnum.ACCOUNT_PROXIES} element={<Account />}>
              <Route index element={<div>Account proxies page</div>} />
              <Route path="help" element={<div>Account proxy help page</div>} />
            </Route>
          </Routes>
        </StyledComponentsThemeProvider>
      </I18nProvider>
    </MemoryRouter>,
  )
}

describe('Account', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('includes the feedback button on the affiliate page title', () => {
    renderComponent(RoutesEnum.ACCOUNT_AFFILIATE_PARTNER)

    expect(screen.getByRole('button', { name: 'Give feedback' })).not.toBeNull()
  })

  it('includes the feedback button on the My Rewards page title', () => {
    renderComponent(RoutesEnum.ACCOUNT_AFFILIATE_TRADER)

    expect(screen.getByRole('button', { name: 'Give feedback' })).not.toBeNull()
  })

  it('does not show the feedback button on other account pages', () => {
    renderComponent(RoutesEnum.ACCOUNT_TOKENS)

    expect(screen.queryByRole('button', { name: 'Give feedback' })).toBeNull()
  })

  it.each(['/1/account-proxy', '/1/account-proxy/help'])('sets the Account Proxy page title on %s', (pathname) => {
    renderComponent(pathname)

    expect(screen.getByTestId('page-title').textContent).toBe('Account Proxy')
    expect(screen.getByRole('heading', { name: 'Account Proxy' })).not.toBeNull()
  })

  it('does not set the Account Proxy page title on other account pages', () => {
    renderComponent(RoutesEnum.ACCOUNT_TOKENS)

    expect(screen.queryByTestId('page-title')).toBeNull()
  })
})
