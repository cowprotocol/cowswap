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
  it('marks Solana as beta while the beta flag is on', () => {
    render(wrap(<ChainStatusBadge chainId={SupportedChainId.SOLANA} isBeta />))

    expect(screen.queryByText('BETA')).not.toBeNull()
  })

  it('renders no badge once the beta flag is off', () => {
    const { container } = render(wrap(<ChainStatusBadge chainId={SupportedChainId.SOLANA} isBeta={false} />))

    expect(container.firstChild).toBeNull()
  })

  it('renders nothing for a non-Solana chain', () => {
    const { container } = render(wrap(<ChainStatusBadge chainId={SupportedChainId.MAINNET} isBeta />))

    expect(container.firstChild).toBeNull()
  })
})
