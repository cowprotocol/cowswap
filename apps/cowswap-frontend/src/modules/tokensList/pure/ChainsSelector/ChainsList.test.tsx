import { ReactElement } from 'react'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { ChainInfo, SupportedChainId } from '@cowprotocol/cow-sdk'

import { render, screen } from '@testing-library/react'

import { ChainsList } from './ChainsList'

i18n.load('en-US', {})
i18n.activate('en-US')

const solana = { id: SupportedChainId.SOLANA, label: 'Solana', logo: { dark: '', light: '' } } as ChainInfo

function renderList(): void {
  const list: ReactElement = <ChainsList chains={[solana]} onSelectChain={jest.fn()} isDarkMode={false} />

  render(<I18nProvider i18n={i18n}>{list}</I18nProvider>)
}

describe('ChainsList', () => {
  // The badge pushed the active checkmark out of place, so the token list carries no chain status
  // badge at all — the network selector and the networks list still do.
  it('shows no chain status badge', () => {
    renderList()

    expect(screen.queryByText('NEW')).toBeNull()
  })
})
