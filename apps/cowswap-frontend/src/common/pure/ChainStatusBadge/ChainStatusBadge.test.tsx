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
  it('marks Solana as alpha before the public launch', () => {
    render(wrap(<ChainStatusBadge chainId={SupportedChainId.SOLANA} isPublicLaunched={false} />))

    expect(screen.queryByText('ALPHA')).not.toBeNull()
    expect(screen.queryByText('NEW')).toBeNull()
  })

  it('marks Solana as new once it is publicly launched', () => {
    render(wrap(<ChainStatusBadge chainId={SupportedChainId.SOLANA} isPublicLaunched />))

    expect(screen.queryByText('NEW')).not.toBeNull()
    expect(screen.queryByText('ALPHA')).toBeNull()
  })

  it('renders nothing for a non-Solana chain', () => {
    const { container } = render(wrap(<ChainStatusBadge chainId={SupportedChainId.MAINNET} isPublicLaunched />))

    expect(container.firstChild).toBeNull()
  })
})
