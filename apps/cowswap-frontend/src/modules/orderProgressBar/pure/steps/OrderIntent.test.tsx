import { ReactElement, ReactNode } from 'react'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Token } from '@cowprotocol/currency'

import { render, RenderResult, screen } from '@testing-library/react'

import type { Order } from 'legacy/state/orders/actions'

import { OrderIntent } from './OrderIntent'

jest.mock('@cowprotocol/tokens', () => ({
  TokenLogo: (): ReactNode => null,
}))

jest.mock('@cowprotocol/ui', () => ({
  ...jest.requireActual('@cowprotocol/ui'),
  TokenAmount: ({ tokenSymbol }: { tokenSymbol: Token }): ReactNode => tokenSymbol.symbol,
}))

i18n.load('en-US', {})
i18n.activate('en-US')

const OWNER = 'GX4F4LvcVHrcBR4qx6P7nD4zt8V6t9LE6YiVFNAWyAYM'
const RECIPIENT = '4B89hPSCqEp5xkKyhjuMg48phEJqzUt4vkdmmLJv5s1D'

const USDC = new Token(SupportedChainId.SOLANA, 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', 6, 'USDC', 'USDC')
const SOL = new Token(SupportedChainId.SOLANA, 'So11111111111111111111111111111111111111112', 9, 'SOL', 'SOL')

function buildOrder(overrides: Partial<Order>): Order {
  return {
    inputToken: USDC,
    outputToken: SOL,
    kind: OrderKind.SELL,
    sellAmount: '1000000',
    buyAmount: '9000000',
    owner: OWNER,
    receiver: OWNER,
    ...overrides,
  } as Order
}

function renderIntent(element: ReactElement): RenderResult {
  return render(<I18nProvider i18n={i18n}>{element}</I18nProvider>)
}

describe('OrderIntent', () => {
  it('mentions a custom recipient', () => {
    renderIntent(<OrderIntent order={buildOrder({ receiver: RECIPIENT })} />)

    expect(screen.getByRole('link').textContent).toBe('4B89hP...5s1D ↗')
  })

  it('does not mention the recipient when it is the owner', () => {
    renderIntent(<OrderIntent order={buildOrder({})} />)

    expect(screen.queryByRole('link')).toBeNull()
  })

  it('does not mention the recipient of a bridge order', () => {
    const bridgeOutputAmount = CurrencyAmount.fromRawAmount(SOL, '9000000')

    renderIntent(<OrderIntent order={buildOrder({ receiver: RECIPIENT, bridgeOutputAmount })} />)

    expect(screen.queryByRole('link')).toBeNull()
  })
})
