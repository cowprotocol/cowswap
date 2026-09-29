import { ReactElement } from 'react'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { fireEvent, render, screen } from '@testing-library/react'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/macro'
import { getCowswapTheme } from 'theme'

import { OrderSubmittedContent } from './index'

function renderSubmittedContent(ui: ReactElement): ReturnType<typeof render> {
  return render(
    <I18nProvider i18n={i18n}>
      <StyledComponentsThemeProvider theme={getCowswapTheme(false)}>{ui}</StyledComponentsThemeProvider>
    </I18nProvider>,
  )
}

const defaultProps = {
  chainId: SupportedChainId.MAINNET,
  account: '0x0001',
  isSafeWallet: false,
  hash: '0xorder',
  onDismiss: jest.fn(),
}

describe('OrderSubmittedContent()', () => {
  beforeAll(async () => {
    await i18n.activate('en-US')
  })

  it('renders View in Orders when a handler is provided', () => {
    const onViewOrders = jest.fn()

    renderSubmittedContent(<OrderSubmittedContent {...defaultProps} onViewOrders={onViewOrders} />)

    fireEvent.click(screen.getByRole('button', { name: 'View in Orders' }))

    expect(onViewOrders).toHaveBeenCalledTimes(1)
  })

  it('hides View in Orders when no handler is provided', () => {
    renderSubmittedContent(<OrderSubmittedContent {...defaultProps} />)

    expect(screen.queryByRole('button', { name: 'View in Orders' })).toBeNull()
  })
})
