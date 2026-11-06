import React, { act } from 'react'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Token } from '@cowprotocol/currency'

import { fireEvent, render, screen } from '@testing-library/react'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/macro'
import { getCowswapTheme } from 'theme'

import { SolanaOrderNotPlaced } from './index'

i18n.load('en-US', {})
i18n.activate('en-US')

const wrappedSol = new Token(SupportedChainId.SOLANA, 'So11111111111111111111111111111111111111112', 9, 'WSOL')
const usdc = new Token(SupportedChainId.SOLANA, 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', 6, 'USDC')

const ERROR_MESSAGE = 'An unknown error occurred while handling the keyring (v2) request'
const LOGS = ['Program log: CreateIdempotent', 'Program log: Error: Associated address does not match seed derivation']

function renderScreen(logs: string[] | null = null, onDismiss = jest.fn()): { onDismiss: jest.Mock } {
  render(
    <StyledComponentsThemeProvider theme={getCowswapTheme(false)}>
      <I18nProvider i18n={i18n}>
        <SolanaOrderNotPlaced
          errorMessage={ERROR_MESSAGE}
          logs={logs}
          inputAmount={CurrencyAmount.fromRawAmount(usdc, '1000000')}
          outputAmount={CurrencyAmount.fromRawAmount(wrappedSol, '8273000')}
          onDismiss={onDismiss}
        />
      </I18nProvider>
    </StyledComponentsThemeProvider>,
  )

  return { onDismiss }
}

describe('SolanaOrderNotPlaced', () => {
  it('states that nothing was submitted instead of repeating the wallet', () => {
    renderScreen()

    expect(screen.getByText('Order not placed')).toBeTruthy()
    expect(screen.getByText('Transaction checks failed')).toBeTruthy()
    expect(screen.getByText("The transaction didn't pass its checks, so your order wasn't submitted.")).toBeTruthy()
  })

  // The whole point of the screen: the wallet's own wording is kept, but out of the way.
  it('hides the raw error until the details are opened', () => {
    renderScreen()

    expect(screen.queryByText(ERROR_MESSAGE)).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: /Show technical details/ }))

    expect(screen.getByText(ERROR_MESSAGE)).toBeTruthy()
    expect(screen.getByRole('button', { name: /Hide technical details/ })).toBeTruthy()
  })

  // A wallet-level failure never reaches simulation, so there is no log section to show.
  it('omits the log section when the failure carried none', () => {
    renderScreen()

    fireEvent.click(screen.getByRole('button', { name: /Show technical details/ }))

    expect(screen.queryByText('Logs (excerpt)')).toBeNull()
  })

  it('shows the log excerpt when the failure carried logs', () => {
    renderScreen(LOGS)

    fireEvent.click(screen.getByRole('button', { name: /Show technical details/ }))

    expect(screen.getByText('Logs (excerpt)')).toBeTruthy()
    // getByText collapses whitespace, so the joined block is matched by its collapsed form.
    expect(screen.getByText(LOGS.join(' '))).toBeTruthy()
  })

  it('copies the error and its logs together', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })

    renderScreen(LOGS)

    fireEvent.click(screen.getByRole('button', { name: /Show technical details/ }))
    // The copy resolves asynchronously and flips the button label, so let that settle in-act.
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Copy details' }))
    })

    expect(writeText).toHaveBeenCalledWith(`Error message\n${ERROR_MESSAGE}\n\nLogs (excerpt)\n${LOGS.join('\n')}`)
  })

  it('leaves the flow through the primary action', () => {
    const { onDismiss } = renderScreen()

    fireEvent.click(screen.getByRole('button', { name: 'Back to review' }))

    expect(onDismiss).toHaveBeenCalledTimes(1)
  })
})
