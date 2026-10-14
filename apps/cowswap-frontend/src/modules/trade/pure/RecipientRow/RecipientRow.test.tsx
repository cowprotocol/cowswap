import { ReactElement } from 'react'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { render, RenderResult, screen } from '@testing-library/react'

import { RecipientRow } from './index'

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

function renderRow(element: ReactElement): RenderResult {
  return render(<I18nProvider i18n={i18n}>{element}</I18nProvider>)
}

const SOLANA_ACCOUNT = 'GX4F4LvcVHrcBR4qx6P7nD4zt8V6t9LE6YiVFNAWyAYM'
const SOLANA_RECIPIENT = '4B89hPSCqEp5xkKyhjuMg48phEJqzUt4vkdmmLJv5s1D'
const EVM_ACCOUNT = '0x0000000000000000000000000000000000000001'
const EVM_RECIPIENT = '0x0000000000000000000000000000000000000002'

describe('RecipientRow', () => {
  it('renders a shortened Solana recipient that differs from the account', () => {
    renderRow(
      <RecipientRow
        chainId={SupportedChainId.SOLANA}
        recipient={SOLANA_RECIPIENT}
        recipientAddress={undefined}
        account={SOLANA_ACCOUNT}
      />,
    )

    expect(screen.getByText('Recipient')).toBeTruthy()
    expect(screen.getByRole('link').textContent).toBe('4B89hP...5s1D ↗')
  })

  it('renders nothing when the Solana recipient is the account', () => {
    const { container } = renderRow(
      <RecipientRow
        chainId={SupportedChainId.SOLANA}
        recipient={SOLANA_ACCOUNT}
        recipientAddress={undefined}
        account={SOLANA_ACCOUNT}
      />,
    )

    expect(container.innerHTML).toBe('')
  })

  it('renders a shortened EVM recipient', () => {
    renderRow(
      <RecipientRow
        chainId={SupportedChainId.MAINNET}
        recipient={EVM_RECIPIENT}
        recipientAddress={undefined}
        account={EVM_ACCOUNT}
      />,
    )

    expect(screen.getByRole('link').textContent).toBe('0x0000...0002 ↗')
  })
})
