import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { render, screen } from '@testing-library/react'

import { WAIT_AND_SAVE_DOCS_HREF } from './waitAndSaveRow.constants'
import { WaitAndSaveTooltipContent } from './WaitAndSaveTooltipContent.pure'

jest.mock('@cowprotocol/ui', () => ({
  ...jest.requireActual('@cowprotocol/ui'),
  ExternalLink: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>,
}))

describe('WaitAndSaveTooltipContent', () => {
  it('includes the save amount sentence when provided', () => {
    render(
      <I18nProvider i18n={i18n}>
        <WaitAndSaveTooltipContent saveAmount="$1.00" />
      </I18nProvider>,
    )

    expect(screen.getByText(/That’s \$1\.00 less on this swap/)).toBeTruthy()
    expect(screen.getByRole('link', { name: /How Wait & save works/ }).getAttribute('href')).toBe(
      WAIT_AND_SAVE_DOCS_HREF,
    )
  })

  it('omits the save amount sentence when not provided', () => {
    render(
      <I18nProvider i18n={i18n}>
        <WaitAndSaveTooltipContent />
      </I18nProvider>,
    )

    expect(screen.getByText('Join the next batch and pay no volume fee.')).toBeTruthy()
    expect(screen.queryByText(/less on this swap/)).toBeNull()
  })
})
