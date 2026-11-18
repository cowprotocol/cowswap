import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount } from '@cowprotocol/currency'

import { render, screen } from '@testing-library/react'
import { ThemeProvider } from 'styled-components/macro'
import { getCowswapTheme } from 'theme'

import { TxCostRow } from './index'

const SOL = NATIVE_CURRENCIES[SupportedChainId.SOLANA]
const TX_COST = CurrencyAmount.fromRawAmount(SOL, '6806880')
const WSOL_RENT = CurrencyAmount.fromRawAmount(SOL, '2039280')

// jsdom ships no `matchMedia`, which the row reaches through `ConfirmDetailsItem`'s responsive styling.
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    }),
  })
})

// The shared `test-utils` wrapper mounts `LanguageProvider`, which reads the router — more than a
// presentational row needs, and it throws without a `MemoryRouter` above it.
function renderRow(props: Partial<Parameters<typeof TxCostRow>[0]> = {}): void {
  render(
    <TxCostRow
      txCost={TX_COST}
      txCostUsd={null}
      isSponsored={false}
      ownerDeposit={null}
      ownerDepositUsd={null}
      isFeePaidByVaultMember={false}
      {...props}
    />,
    {
      wrapper: ({ children }) => (
        <I18nProvider i18n={i18n}>
          <ThemeProvider theme={getCowswapTheme(false)}>{children}</ThemeProvider>
        </I18nProvider>
      ),
    },
  )
}

describe('TxCostRow', () => {
  // The vault funds the account deposits but never the fee, so the amount alone understates what the
  // trade costs — the marker stands in for the fee the executing member pays, as it does for a Safe.
  it('marks the fee the executing member pays with "+ gas"', () => {
    renderRow({ isFeePaidByVaultMember: true })

    expect(screen.queryByText(/\+\s*gas/)).not.toBeNull()
  })

  it('leaves the marker off an ordinary wallet, which pays the fee in the amount shown', () => {
    renderRow()

    expect(screen.queryByText(/\+\s*gas/)).toBeNull()
  })

  // "FREE" and "+ gas" would contradict each other; a vault is never sponsored, so the row must not
  // start claiming both if that ever changes.
  it('leaves the marker off a fully sponsored placement', () => {
    renderRow({ isSponsored: true, isFeePaidByVaultMember: true })

    expect(screen.queryByText(/\+\s*gas/)).toBeNull()
  })

  it('still shows the owner deposit the sponsor does not cover', () => {
    renderRow({ isSponsored: true, ownerDeposit: WSOL_RENT })

    expect(screen.queryByText('FREE')).toBeNull()
  })
})
