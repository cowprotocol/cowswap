import { ReactElement } from 'react'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { ChainInfo, SupportedChainId } from '@cowprotocol/cow-sdk'

import { render, screen } from '@testing-library/react'

import { ChainsList } from './ChainsList'

i18n.load('en-US', {})
i18n.activate('en-US')

const solana = { id: SupportedChainId.SOLANA, label: 'Solana', logo: { dark: '', light: '' } } as ChainInfo

function renderList(sourceChainId?: SupportedChainId): void {
  const list: ReactElement = (
    <ChainsList chains={[solana]} onSelectChain={jest.fn()} isDarkMode={false} sourceChainId={sourceChainId} />
  )

  render(<I18nProvider i18n={i18n}>{list}</I18nProvider>)
}

describe('ChainsList status badge', () => {
  it('shows the badge when picking the sell network', () => {
    renderList()

    expect(screen.queryByText('ALPHA')).not.toBeNull()
  })

  it('shows the badge for a same-chain buy', () => {
    renderList(SupportedChainId.SOLANA)

    expect(screen.queryByText('ALPHA')).not.toBeNull()
  })

  it('hides the badge for a cross-chain buy destination', () => {
    renderList(SupportedChainId.MAINNET)

    expect(screen.queryByText('ALPHA')).toBeNull()
  })
})
