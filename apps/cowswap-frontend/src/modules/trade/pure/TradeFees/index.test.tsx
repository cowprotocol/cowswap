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

function renderFees(isFreePlacement?: boolean): void {
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
          isFreePlacement={isFreePlacement}
        />
      </I18nProvider>
    </StyledComponentsThemeProvider>,
  )
}

describe('TradeFees', () => {
  it('labels a feeless placement as FREE by default', () => {
    renderFees()

    expect(screen.getByText('FREE')).toBeTruthy()
  })

  // On a non-sponsored Solana order the owner pays rent and the transaction fee, so FREE would lie.
  it('renders no fee row when the placement is not free', () => {
    renderFees(false)

    expect(screen.queryByText('FREE')).toBeNull()
    expect(screen.queryByText('Fee')).toBeNull()
  })
})
