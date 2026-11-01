import React from 'react'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Token } from '@cowprotocol/currency'

import { render, screen } from '@testing-library/react'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/macro'
import { getCowswapTheme } from 'theme'

import { VolumeFeeTooltip } from 'modules/volumeFee'

import { TradeFees } from './index'

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

const usdc = new Token(SupportedChainId.SOLANA, 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', 6, 'USDC')

const volumeFeeTooltip: VolumeFeeTooltip = { content: undefined, label: 'Total fee' }

function renderFees(): void {
  render(
    <StyledComponentsThemeProvider theme={getCowswapTheme(false)}>
      <I18nProvider i18n={i18n}>
        <TradeFees
          partnerFeeAmount={CurrencyAmount.fromRawAmount(usdc, '0')}
          partnerFeeUsd={null}
          partnerFeeBps={0}
          protocolFeeAmount={CurrencyAmount.fromRawAmount(usdc, '0')}
          protocolFeeUsd={null}
          protocolFeeBps={0}
          volumeFeeTooltip={volumeFeeTooltip}
        />
      </I18nProvider>
    </StyledComponentsThemeProvider>,
  )
}

describe('TradeFees', () => {
  // The protocol charges nothing for placement on any chain, Solana included.
  it('labels a feeless placement as FREE', () => {
    renderFees()

    expect(screen.getByText('FREE')).toBeTruthy()
  })
})
