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
  PageTitle: () => null,
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
})
