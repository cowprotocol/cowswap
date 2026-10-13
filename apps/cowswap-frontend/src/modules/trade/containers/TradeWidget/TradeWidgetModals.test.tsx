import { Provider as AtomProvider } from 'jotai'
import React, { act } from 'react'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { jotaiStore } from '@cowprotocol/core'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Token } from '@cowprotocol/currency'

import { fireEvent, render, screen } from '@testing-library/react'
import { solanaOrderNotPlacedAtom, solanaSigningWindowExpiredAtom } from 'entities/trade'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/macro'
import { getCowswapTheme } from 'theme'

import { TradeWidgetModals } from './TradeWidgetModals'

import {
  setCloseTradeConfirmAtom,
  setErrorTradeConfirmAtom,
  tradeConfirmStateAtom,
} from '../../state/tradeConfirmStateAtom'

// Hoisted so every hook returns the same identity across renders, as the real ones do. Fresh
// `jest.fn()`s per render would change `resetAllScreens`, whose mount effect would then re-fire
// forever.
const mockNoop = jest.fn()
const mockApproveState = { approveInProgress: false, isPendingInProgress: false, error: undefined }
const mockClosedModalState = { isModalOpen: false, closeModal: mockNoop }
const mockTokenListAddingError = [null, mockNoop]
const mockWrapNativeState = [{ isOpen: false, errorMessage: undefined }, mockNoop]
const mockAutoImportState = { tokensToImport: [], modalState: mockClosedModalState }
const mockTradeQuoteState: { quote: object | null; error: Error | null } = { quote: {}, error: null }

jest.mock('@cowprotocol/tokens', () => ({ useAddUserToken: () => mockNoop, TokenLogo: () => null }))
jest.mock('@cowprotocol/wallet', () => ({
  useWalletInfo: () => ({ chainId: 1399811149, account: '0xaccount' }),
}))
jest.mock('modules/erc20Approve', () => ({
  TradeApproveModal: () => null,
  TradeChangeApproveAmountModal: () => null,
  useGetUserApproveAmountState: () => mockClosedModalState,
  useResetApproveProgressModalState: () => mockNoop,
  useSetUserApproveAmountModalState: () => mockNoop,
}))
jest.mock('modules/erc20Approve/state/useTradeApproveState', () => ({
  useTradeApproveState: () => mockApproveState,
}))
jest.mock('modules/rwa', () => ({
  RwaConsentModalContainer: () => null,
  useRwaConsentModalState: () => mockClosedModalState,
}))
jest.mock('modules/tokensList', () => ({
  ImportTokenModal: () => null,
  useCloseTokenSelectWidget: () => mockNoop,
  useRestrictedTokensImportStatus: () => ({ restriction: null }),
  useSelectTokenWidgetState: () => ({ field: undefined }),
  useTokenListAddingError: () => mockTokenListAddingError,
}))
jest.mock('modules/tradeQuote', () => ({ useTradeQuote: () => mockTradeQuoteState }))
jest.mock('modules/zeroApproval', () => ({
  ZeroApprovalModal: () => null,
  useZeroApproveModalState: () => mockClosedModalState,
}))
jest.mock('../../hooks/useAutoImportTokensState', () => ({
  useAutoImportTokensState: () => mockAutoImportState,
}))
jest.mock('../../hooks/useTradeState', () => ({ useTradeState: () => ({ state: null }) }))
jest.mock('../../hooks/useWrapNativeScreenState', () => ({
  useWrapNativeScreenState: () => mockWrapNativeState,
}))
jest.mock('../WrapNativeModal', () => ({ WrapNativeModal: () => null }))

i18n.load('en-US', {})
i18n.activate('en-US')

const usdc = new Token(SupportedChainId.SOLANA, 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', 6, 'USDC')
const wrappedSol = new Token(SupportedChainId.SOLANA, 'So11111111111111111111111111111111111111112', 9, 'WSOL')

const EXPIRED_TRADE = {
  inputAmount: CurrencyAmount.fromRawAmount(usdc, '1000000'),
  outputAmount: CurrencyAmount.fromRawAmount(wrappedSol, '8273000'),
}
const WINDOW_CLOSED_MESSAGE = 'The signing window closed before the transaction was signed.'

// The flow fails while the widget is already mounted, so the state has to land after the first
// render — the mount effect resets every screen and would wipe anything staged before it.
function failTrade(message: string, expiredTrade: typeof EXPIRED_TRADE | null): void {
  act(() => {
    jotaiStore.set(setErrorTradeConfirmAtom, message)
    jotaiStore.set(solanaSigningWindowExpiredAtom, expiredTrade)
  })
}

function renderModals(): void {
  render(
    <AtomProvider store={jotaiStore}>
      <StyledComponentsThemeProvider theme={getCowswapTheme(false)}>
        <I18nProvider i18n={i18n}>
          <TradeWidgetModals confirmModal={<div>REVIEW SCREEN</div>} genericModal={undefined} />
        </I18nProvider>
      </StyledComponentsThemeProvider>
    </AtomProvider>,
  )
}

beforeEach(() => {
  jotaiStore.set(setCloseTradeConfirmAtom)
  jotaiStore.set(solanaSigningWindowExpiredAtom, null)
  jotaiStore.set(solanaOrderNotPlacedAtom, null)
  mockTradeQuoteState.quote = {}
  mockTradeQuoteState.error = null
})

describe('TradeWidgetModals · Solana signing window expired', () => {
  it('shows the dedicated screen when the expired trade is set alongside the error', () => {
    renderModals()
    failTrade(WINDOW_CLOSED_MESSAGE, EXPIRED_TRADE)

    expect(screen.getByText('Signing window expired')).toBeTruthy()
    expect(screen.getByText('No order was submitted')).toBeTruthy()
    expect(screen.queryByText('Dismiss')).toBeNull()
  })

  it('keeps every other failure on the generic error screen', () => {
    renderModals()
    failTrade('Something else went wrong', null)

    expect(screen.getByText('Something else went wrong')).toBeTruthy()
    expect(screen.getByText('Dismiss')).toBeTruthy()
    expect(screen.queryByText('Signing window expired')).toBeNull()
  })

  // The point of the screen: the attempt is retried from review with a fresh price, rather than
  // dropping the user back onto the swap form with the trade lost.
  it('reopens the review screen with forced price confirmation on dismiss', () => {
    renderModals()
    failTrade(WINDOW_CLOSED_MESSAGE, EXPIRED_TRADE)

    fireEvent.click(screen.getByText('Back to swap'))

    const state = jotaiStore.get(tradeConfirmStateAtom)

    expect(state.isOpen).toBe(true)
    expect(state.forcePriceConfirmation).toBe(true)
    expect(state.error).toBeNull()
    expect(jotaiStore.get(solanaSigningWindowExpiredAtom)).toBeNull()
    expect(screen.getByText('REVIEW SCREEN')).toBeTruthy()
  })

  // Review has nothing to offer without a quote: its confirm button is disabled and says nothing
  // about why, while the form reports the quote error itself.
  it.each([
    ['the quote request failed', { quote: {}, error: new Error('quote api is down') }],
    ['no quote has been loaded', { quote: null, error: null }],
  ])('returns to the swap form rather than review when %s', (_label, quoteState) => {
    renderModals()
    mockTradeQuoteState.quote = quoteState.quote
    mockTradeQuoteState.error = quoteState.error
    failTrade(WINDOW_CLOSED_MESSAGE, EXPIRED_TRADE)

    fireEvent.click(screen.getByText('Back to swap'))

    const state = jotaiStore.get(tradeConfirmStateAtom)

    expect(state.isOpen).toBe(false)
    expect(state.error).toBeNull()
    expect(jotaiStore.get(solanaSigningWindowExpiredAtom)).toBeNull()
    expect(screen.queryByText('REVIEW SCREEN')).toBeNull()
  })

  it('leaves the generic error screen closing the flow instead of reopening review', () => {
    renderModals()
    failTrade('Something else went wrong', null)

    fireEvent.click(screen.getByText('Dismiss'))

    expect(jotaiStore.get(tradeConfirmStateAtom).isOpen).toBe(false)
  })
})

describe('TradeWidgetModals · Solana order not placed', () => {
  const WALLET_ERROR = 'An unknown error occurred while handling the keyring (v2) request'

  function failBeforeHandOver(): void {
    act(() => {
      jotaiStore.set(setErrorTradeConfirmAtom, WALLET_ERROR)
      jotaiStore.set(solanaOrderNotPlacedAtom, {
        tradeAmounts: EXPIRED_TRADE,
        errorMessage: WALLET_ERROR,
        logs: null,
      })
    })
  }

  it('replaces the generic error screen and keeps the wallet wording out of the headline', () => {
    renderModals()
    failBeforeHandOver()

    expect(screen.getByText('Order not placed')).toBeTruthy()
    expect(screen.getByText('Transaction checks failed')).toBeTruthy()
    expect(screen.queryByText('Dismiss')).toBeNull()
    expect(screen.queryByText(WALLET_ERROR)).toBeNull()
  })

  // Both Solana failure screens share one exit, so this must behave like the expired one.
  it('reopens the review screen with forced price confirmation on dismiss', () => {
    renderModals()
    failBeforeHandOver()

    fireEvent.click(screen.getByRole('button', { name: 'Back to review' }))

    const state = jotaiStore.get(tradeConfirmStateAtom)

    expect(state.isOpen).toBe(true)
    expect(state.forcePriceConfirmation).toBe(true)
    expect(jotaiStore.get(solanaOrderNotPlacedAtom)).toBeNull()
    expect(screen.getByText('REVIEW SCREEN')).toBeTruthy()
  })

  // The expired screen is the more specific diagnosis, so it wins when both somehow apply.
  it('yields to the expired screen when both are set', () => {
    renderModals()
    act(() => {
      jotaiStore.set(setErrorTradeConfirmAtom, WINDOW_CLOSED_MESSAGE)
      jotaiStore.set(solanaSigningWindowExpiredAtom, EXPIRED_TRADE)
      jotaiStore.set(solanaOrderNotPlacedAtom, {
        tradeAmounts: EXPIRED_TRADE,
        errorMessage: WINDOW_CLOSED_MESSAGE,
        logs: null,
      })
    })

    expect(screen.getByText('Signing window expired')).toBeTruthy()
    expect(screen.queryByText('Order not placed')).toBeNull()
  })
})
