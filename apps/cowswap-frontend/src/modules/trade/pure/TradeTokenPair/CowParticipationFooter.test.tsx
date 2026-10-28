import { ReactNode } from 'react'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { render, RenderResult, screen } from '@testing-library/react'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/macro'
import { getCowswapTheme } from 'theme'

import { CowParticipationFooter, CowParticipationFooterProps } from './CowParticipationFooter.pure'

jest.mock('@cowprotocol/ui', () => {
  const actual = jest.requireActual('@cowprotocol/ui')

  return {
    ...actual,
    ProductLogo: () => <span data-testid="product-logo" />,
    TooltipIcon: ({ content }: { content: ReactNode }) => <span data-testid="tooltip-icon">{content}</span>,
  }
})

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

function renderFooter(props: CowParticipationFooterProps): RenderResult {
  return render(
    <StyledComponentsThemeProvider theme={getCowswapTheme(false)}>
      <I18nProvider i18n={i18n}>
        <CowParticipationFooter {...props} />
      </I18nProvider>
    </StyledComponentsThemeProvider>,
  )
}

describe('CowParticipationFooter', () => {
  it('renders the CoW strip when the batch beat trading alone', () => {
    renderFooter({ hasAloneBid: true, kind: 'cow' })

    expect(screen.getByText('You were part of a CoW')).toBeTruthy()
    expect(screen.getByTestId('tooltip-icon').textContent).toBe(
      'Your order was part of a Coincidence of Wants (CoW): solvers combined it with other traders’ orders in the same batch, and you got more than trading alone.',
    )
  })

  it('names a shared batch, and says there was nothing to compare when no solo bid exists', () => {
    renderFooter({ companionCount: 1, hasAloneBid: false, kind: 'batched' })

    expect(screen.getByText('Wait & save · Batched with 1 other')).toBeTruthy()
    expect(screen.getByTestId('tooltip-icon').textContent).toBe(
      'Solvers included your order in a batch with other orders. There was no offer for your order alone to compare, so there’s no separate gain to show.',
    )
  })

  it('uses the plural when several other orders shared the batch', () => {
    renderFooter({ companionCount: 3, hasAloneBid: true, kind: 'batched' })

    expect(screen.getByText('Wait & save · Batched with 3 others')).toBeTruthy()
    expect(screen.getByTestId('tooltip-icon').textContent).toBe(
      'Solvers included your order in a batch with other orders. There’s no separate gain to show.',
    )
  })

  it('says the order joined the batch when the winning solution is only that order', () => {
    renderFooter({ hasAloneBid: false, kind: 'joined' })

    expect(screen.getByText('Wait & save · Joined the batch')).toBeTruthy()
    expect(screen.getByTestId('tooltip-icon').textContent).toBe(
      'The winning solution contained only your order. There was no offer for your order alone to compare, so there’s no separate gain to show.',
    )
  })

  it('does not claim the auction shape when the comparison never arrived', () => {
    renderFooter({ comparisonUnavailable: true, hasAloneBid: false, kind: 'joined' })

    expect(screen.getByText('Wait & save · Joined the batch')).toBeTruthy()
    expect(screen.getByTestId('tooltip-icon').textContent).toBe('There’s no separate gain to show.')
  })
})
