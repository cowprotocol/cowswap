import React from 'react'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Token } from '@cowprotocol/currency'

import { act, render, screen } from '@testing-library/react'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/macro'
import { getCowswapTheme } from 'theme'

import { SolanaSigningCountdown } from './index'

i18n.load('en-US', {})
i18n.activate('en-US')

class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

const NOW_MS = 1_700_000_000_000
const wrappedSol = new Token(SupportedChainId.SOLANA, 'So11111111111111111111111111111111111111112', 9, 'WSOL')
const usdc = new Token(SupportedChainId.SOLANA, 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', 6, 'USDC')

function renderCountdown(expiresAt: number): void {
  render(
    <StyledComponentsThemeProvider theme={getCowswapTheme(false)}>
      <I18nProvider i18n={i18n}>
        <SolanaSigningCountdown
          expiresAt={expiresAt}
          durationMs={60_000}
          inputAmount={CurrencyAmount.fromRawAmount(usdc, '1000000')}
          outputAmount={CurrencyAmount.fromRawAmount(wrappedSol, '8273000')}
          onDismiss={jest.fn()}
        />
      </I18nProvider>
    </StyledComponentsThemeProvider>,
  )
}

describe('SolanaSigningCountdown', () => {
  beforeEach(() => {
    window.ResizeObserver = ResizeObserverStub
    jest.useFakeTimers()
    jest.setSystemTime(NOW_MS)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('shows the expired signing screen when expiresAt passes', () => {
    renderCountdown(NOW_MS + 5_000)

    expect(screen.queryByText('Signing time expired')).toBeNull()

    act(() => {
      jest.advanceTimersByTime(5_000)
    })

    expect(screen.getAllByText('Signing time expired').length).toBeGreaterThan(0)
  })
})
