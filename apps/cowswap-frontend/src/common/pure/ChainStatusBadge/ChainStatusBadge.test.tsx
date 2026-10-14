import { ReactElement } from 'react'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { render, screen } from '@testing-library/react'

import { ChainStatusBadge } from './ChainStatusBadge.pure'

i18n.load('en-US', {})
i18n.activate('en-US')

function wrap(element: ReactElement): ReactElement {
  return <I18nProvider i18n={i18n}>{element}</I18nProvider>
}

describe('ChainStatusBadge', () => {
  it('marks Solana as unaudited', () => {
    render(wrap(<ChainStatusBadge chainId={SupportedChainId.SOLANA} />))

    expect(screen.queryByText('ALPHA')).not.toBeNull()
  })

  it('renders nothing for an audited chain', () => {
    const { container } = render(wrap(<ChainStatusBadge chainId={SupportedChainId.MAINNET} />))

    expect(container.firstChild).toBeNull()
  })
})
