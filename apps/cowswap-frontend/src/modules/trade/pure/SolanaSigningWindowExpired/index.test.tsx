import React from 'react'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Token } from '@cowprotocol/currency'

import { fireEvent, render, screen } from '@testing-library/react'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/macro'
import { getCowswapTheme } from 'theme'

import { SolanaSigningWindowExpired } from './index'

i18n.load('en-US', {})
i18n.activate('en-US')

const wrappedSol = new Token(SupportedChainId.SOLANA, 'So11111111111111111111111111111111111111112', 9, 'WSOL')
const usdc = new Token(SupportedChainId.SOLANA, 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', 6, 'USDC')

function renderScreen(onDismiss = jest.fn()): { onDismiss: jest.Mock } {
  render(
    <StyledComponentsThemeProvider theme={getCowswapTheme(false)}>
      <I18nProvider i18n={i18n}>
        <SolanaSigningWindowExpired
          inputAmount={CurrencyAmount.fromRawAmount(usdc, '1000000')}
          outputAmount={CurrencyAmount.fromRawAmount(wrappedSol, '8273000')}
          onDismiss={onDismiss}
        />
      </I18nProvider>
    </StyledComponentsThemeProvider>,
  )

  return { onDismiss }
}

describe('SolanaSigningWindowExpired', () => {
  it('names the expiry instead of reporting a bare error', () => {
    renderScreen()

    expect(screen.getByText('Signing window expired')).toBeTruthy()
    expect(screen.getByText('No order was submitted')).toBeTruthy()
    expect(
      screen.getByText('The signing window closed before the transaction was signed. Please try again.'),
    ).toBeTruthy()
  })

  it('shows the trade the abandoned attempt was for', () => {
    renderScreen()

    expect(screen.getByText('USDC')).toBeTruthy()
    expect(screen.getByText('WSOL')).toBeTruthy()
  })

  it('leaves the flow through the primary action', () => {
    const { onDismiss } = renderScreen()

    fireEvent.click(screen.getByText('Back to swap'))

    expect(onDismiss).toHaveBeenCalledTimes(1)
  })
})
