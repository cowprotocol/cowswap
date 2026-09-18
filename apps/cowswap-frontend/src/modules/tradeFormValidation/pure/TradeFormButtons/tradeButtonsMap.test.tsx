import { ComponentType } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency } from '@cowprotocol/currency'

import { fireEvent, render, screen } from '@testing-library/react'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/macro'
import { getCowswapTheme } from 'theme'

import { tradeButtonsMap } from './tradeButtonsMap'

import { LinguiWrapper } from '../../../../../LinguiJestProvider'
import { TradeFormButtonContext, TradeFormValidation } from '../../types'

jest.mock('react-inlinesvg', () => ({
  __esModule: true,
  default: () => null,
}))

const ENS_TOOLTIP_TEXT = 'ENS recipient not supported for Swap and Bridge. Use address instead.'

const RecipientInvalidButton = tradeButtonsMap[
  TradeFormValidation.RecipientInvalid
] as ComponentType<TradeFormButtonContext>

function currencyOnChain(chainId: number): Currency {
  return { address: '0x1', chainId } as unknown as Currency
}

function renderRecipientInvalidButton(params: {
  inputChainId: number
  outputChainId: number
  recipient: string
  recipientEnsAddress?: string
}): HTMLElement {
  const context = {
    derivedState: {
      inputCurrency: currencyOnChain(params.inputChainId),
      outputCurrency: currencyOnChain(params.outputChainId),
      recipient: params.recipient,
    },
    recipientEnsAddress: params.recipientEnsAddress ?? null,
  } as unknown as TradeFormButtonContext

  const { container } = render(
    <LinguiWrapper>
      <StyledComponentsThemeProvider theme={getCowswapTheme(false)}>
        <RecipientInvalidButton {...context} />
      </StyledComponentsThemeProvider>
    </LinguiWrapper>,
  )

  return container
}

function showTooltip(container: HTMLElement): void {
  const trigger = tooltipTrigger(container)

  if (!trigger) throw new Error('ENS tooltip trigger is not rendered')

  fireEvent.mouseEnter(trigger)
}

function tooltipTrigger(container: HTMLElement): HTMLElement | null {
  const icon = container.querySelector('[class*="QuestionTooltipIconWrapper"]')

  return icon?.parentElement ?? null
}

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'innerText', {
    configurable: true,
    get(): string {
      return this.textContent ?? ''
    },
  })

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
    }),
  })
})

describe('tradeButtonsMap: RecipientInvalid', () => {
  it('always renders the invalid recipient message', () => {
    const container = renderRecipientInvalidButton({
      inputChainId: SupportedChainId.MAINNET,
      outputChainId: SupportedChainId.BASE,
      recipient: '456',
    })

    expect(screen.getByText('Enter a valid recipient')).toBeTruthy()
    expect(container).toBeTruthy()
  })

  it('shows the ENS tooltip when bridging to an EVM chain with an ENS recipient', () => {
    const container = renderRecipientInvalidButton({
      inputChainId: SupportedChainId.MAINNET,
      outputChainId: SupportedChainId.BASE,
      recipient: 'vitalik.eth',
    })

    showTooltip(container)

    expect(screen.getByText(ENS_TOOLTIP_TEXT)).toBeTruthy()
  })

  it('shows the ENS tooltip for an ENS name typed with an uppercase TLD', () => {
    const container = renderRecipientInvalidButton({
      inputChainId: SupportedChainId.MAINNET,
      outputChainId: SupportedChainId.BASE,
      recipient: 'VITALIK.ETH',
    })

    showTooltip(container)

    expect(screen.getByText(ENS_TOOLTIP_TEXT)).toBeTruthy()
  })

  it('shows the ENS tooltip for a non-.eth name that resolves through ENS', () => {
    const container = renderRecipientInvalidButton({
      inputChainId: SupportedChainId.MAINNET,
      outputChainId: SupportedChainId.BASE,
      recipient: 'cow.box',
      recipientEnsAddress: '0xDEf1CA1fb7FBcDC777520aa7f396b4E015F497aB',
    })

    showTooltip(container)

    expect(screen.getByText(ENS_TOOLTIP_TEXT)).toBeTruthy()
  })

  it('does not show the ENS tooltip for a recipient that is not an ENS name', () => {
    const container = renderRecipientInvalidButton({
      inputChainId: SupportedChainId.MAINNET,
      outputChainId: SupportedChainId.BASE,
      recipient: '456',
    })

    expect(tooltipTrigger(container)).toBeNull()
  })

  it('does not show the ENS tooltip for a same-chain swap', () => {
    const container = renderRecipientInvalidButton({
      inputChainId: SupportedChainId.MAINNET,
      outputChainId: SupportedChainId.MAINNET,
      recipient: 'vitalik.eth',
    })

    expect(tooltipTrigger(container)).toBeNull()
  })

  it('does not show the ENS tooltip when bridging to a non-EVM chain', () => {
    const container = renderRecipientInvalidButton({
      inputChainId: SupportedChainId.MAINNET,
      outputChainId: SupportedChainId.SOLANA,
      recipient: 'vitalik.eth',
    })

    expect(tooltipTrigger(container)).toBeNull()
  })
})
