import { Provider as JotaiProvider, createStore } from 'jotai'
import React from 'react'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Provider as ReduxProvider } from 'react-redux'
import { MemoryRouter } from 'react-router'
import { ThemeProvider } from 'styled-components/macro'
import { getCowswapTheme } from 'theme'

import { cowSwapStore } from 'legacy/state'

import { SwapWidget } from './index'

/**
 * Integration test for the SwapWidget "Custom Recipient" scenario.
 *
 * Scenario:
 *   1. Render the whole SwapWidget.
 *   2. Open the settings dropdown (SettingsDropdown, aliased as SettingsTab).
 *   3. Toggle the "Custom Recipient" option on.
 *   4. The recipient input (SetRecipient) should appear inside TradeWidgetForm.
 *
 * What is kept REAL (the wiring under test):
 *   - SwapWidget, TradeWidget, TradeWidgetForm
 *   - SettingsDropdown + its "Custom Recipient" toggle (SettingsBox / Toggle)
 *   - useSwapSettings / useSwapRecipientToggleState (+ the backing jotai atom)
 *   - useIsWithRecipient — the load-bearing gate deciding SetRecipient visibility
 *
 * What is MOCKED (everything not required by the scenario): wallet info,
 * URL/location state, quote/price/trade-flow data, network status, and the
 * heavy/unrelated child components. SetRecipient itself is stubbed so the test
 * asserts on its presence at the correct place in the form without pulling in
 * its ENS/validation internals.
 */

// ─── SwapWidget-level dependencies (external packages) ─────────────────────────

// react-inlinesvg receives a mocked (non-string) svg src and throws; stub it out.
jest.mock('react-inlinesvg', () => ({ __esModule: true, default: () => null }))

jest.mock('@cowprotocol/common-utils', () => ({
  ...jest.requireActual('@cowprotocol/common-utils'),
  isInjectedWidget: () => false,
}))

jest.mock('@cowprotocol/tokens', () => ({
  ...jest.requireActual('@cowprotocol/tokens'),
  useTryFindToken: () => ({ token: undefined, toBeImported: false }),
}))

jest.mock('@cowprotocol/wallet', () => ({
  ...jest.requireActual('@cowprotocol/wallet'),
  useWalletInfo: () => ({ account: undefined, chainId: 1 }),
  useWalletDetails: () => ({ allowsOffchainSigning: true }),
  useIsSafeWallet: () => false,
  useIsSmartContractWallet: () => false,
  useIsEagerConnectInProgress: () => false,
}))

jest.mock('@cowprotocol/common-hooks', () => ({
  ...jest.requireActual('@cowprotocol/common-hooks'),
  useFeatureFlags: () => ({}),
  useTheme: () => ({ darkMode: false }),
  useMediaQuery: () => false,
  useThrottledCallback: (fn: unknown) => fn,
}))

// ─── SwapWidget-level dependencies (internal modules) ──────────────────────────

jest.mock('entities/injectedWidget', () => ({
  ...jest.requireActual('entities/injectedWidget'),
  useInjectedWidgetParams: () => ({}),
}))

jest.mock('legacy/state/user/hooks', () => ({
  ...jest.requireActual('legacy/state/user/hooks'),
  useHooksEnabledManager: () => [false, jest.fn()],
}))

jest.mock('modules/account', () => ({ useToggleAccountModal: () => jest.fn() }))
// Cut a circular import chain (modules/affiliate -> pages/Account/styled) that
// only surfaces under jest's module-eval order and is irrelevant to the scenario.
jest.mock('modules/affiliate', () => ({}))
jest.mock('modules/erc20Approve', () => ({ TradeApproveWithAffectedOrderList: () => null }))
jest.mock('modules/ethFlow', () => ({ EthFlowModal: () => null }))
jest.mock('modules/injectedWidget', () => ({ useIsInfiniteApproveDisabledInWidget: () => false }))
jest.mock('modules/tokensList', () => ({
  AddIntermediateTokenModal: () => null,
  SelectTokenWidget: () => null,
  useSelectTokenWidgetState: () => ({ open: false }),
  useOpenTokenSelectWidget: () => jest.fn(),
  useChainsToSelect: () => undefined,
}))
jest.mock('modules/tradeFlow', () => ({
  useHandleSwap: () => ({ callback: jest.fn(), contextIsReady: false }),
}))
jest.mock('modules/tradeFormValidation', () => ({
  useIsTradeFormValidationPassed: () => false,
  useShouldHideTradeRateDetails: () => false,
  useGetTradeFormValidation: () => null,
  TradeFormValidation: {},
}))
jest.mock('modules/tradeQuote', () => ({
  useTradeQuote: () => ({ isLoading: false, bridgeQuote: null, error: null }),
}))
jest.mock('modules/tradeSlippage', () => ({
  useSetShouldUseAutoSlippage: () => jest.fn(),
}))
jest.mock('modules/rwa', () => ({
  useTokenSelectorConsentFlow: () => undefined,
}))

// ─── modules/trade leaf hooks (barrel + TradeWidgetForm both resolve here) ─────
// NOTE: useWithRecipient (useIsWithRecipient) is deliberately left REAL.

jest.mock('modules/trade/hooks/useGetReceiveAmountInfo', () => ({ useGetReceiveAmountInfo: () => null }))
jest.mock('modules/trade/hooks/useIsEoaEthFlow', () => ({ useIsEoaEthFlow: () => false }))
jest.mock('modules/trade/hooks/useIsNonEvmBridging', () => ({ useIsNonEvmBridging: () => false }))
jest.mock('modules/trade/hooks/useTradePriceImpact', () => ({
  useTradePriceImpact: () => ({ priceImpact: undefined, loading: false }),
}))
jest.mock('modules/trade/hooks/useWrapNativeFlow', () => ({ useWrapNativeFlow: () => jest.fn() }))
jest.mock('modules/trade/hooks/useIsWrapOrUnwrap', () => ({ useIsWrapOrUnwrap: () => false }))
jest.mock('modules/trade/hooks/useDerivedTradeState', () => ({ useDerivedTradeState: () => ({ orderKind: 'sell' }) }))
jest.mock('modules/trade/hooks/useIsCurrentTradeBridging', () => ({ useIsCurrentTradeBridging: () => false }))
jest.mock('modules/trade/hooks/useIsQuoteUpdatePossible', () => ({ useIsQuoteUpdatePossible: () => false }))
jest.mock('modules/trade/hooks/useLimitOrdersPromoBanner', () => ({
  useLimitOrdersPromoBanner: () => ({ shouldBeVisible: false }),
}))
jest.mock('modules/trade/hooks/useResetReceiverConfirmationOnWalletChange', () => ({
  useResetReceiverConfirmationOnWalletChange: () => undefined,
}))
jest.mock('modules/trade/hooks/useResetRecipientOnChainChange', () => ({
  useResetRecipientOnChainChange: () => undefined,
}))
jest.mock('modules/trade/hooks/useShouldHideQuoteAmounts', () => ({ useShouldHideQuoteAmounts: () => false }))
jest.mock('modules/trade/hooks/useTradeTypeInfoFromUrl', () => ({ useTradeTypeInfoFromUrl: () => null }))
jest.mock('modules/trade/hooks/setupTradeState/useTradeStateFromUrl', () => ({ useTradeStateFromUrl: () => null }))
jest.mock('modules/trade/state/alternativeOrder', () => ({
  ...jest.requireActual('modules/trade/state/alternativeOrder'),
  useIsAlternativeOrderModalVisible: () => false,
}))
jest.mock('modules/trade/state/nonEvmReceiverConfirmedAtom.atoms', () => ({
  ...jest.requireActual('modules/trade/state/nonEvmReceiverConfirmedAtom.atoms'),
  useSetNonEvmReceiverConfirmed: () => jest.fn(),
}))

// ─── modules/trade child components / internals (not part of the scenario) ─────

jest.mock('modules/trade/containers/TradeWidget/TradeWidgetUpdaters', () => ({ TradeWidgetUpdaters: () => null }))
jest.mock('modules/trade/containers/TradeWidget/TradeWidgetModals', () => ({
  // Skip all modal branches and render the trade form directly.
  TradeWidgetModals: ({ renderFallback }: { renderFallback: () => React.ReactNode }) => <>{renderFallback()}</>,
}))
jest.mock('modules/trade/pure/SetRecipient', () => ({
  SetRecipient: () => <div data-testid="set-recipient">Recipient</div>,
}))
jest.mock('modules/trade/containers/LimitOrdersPromoBannerWrapper', () => ({
  LimitOrdersPromoBannerWrapper: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))
jest.mock('modules/trade/containers/QuotePolingProgress', () => ({ QuotePolingProgress: () => null }))
jest.mock('modules/trade/containers/TradeWarnings', () => ({ TradeWarnings: () => null }))
jest.mock('modules/trade/containers/TradeWidgetLinks', () => ({ TradeWidgetLinks: () => null }))
jest.mock('modules/trade/containers/WrapFlowActionButton', () => ({ WrapFlowActionButton: () => null }))
jest.mock('modules/wallet', () => ({ WalletStatusButton: () => null }))

// ─── Settings dropdown siblings not related to the recipient toggle ────────────

jest.mock('modules/tradeWidgetAddons/containers/TransactionSlippageInput/TransactionSlippageInput.container', () => ({
  TransactionSlippageInput: () => null,
}))
jest.mock(
  'modules/tradeWidgetAddons/containers/DeadlineTransactionSettings/DeadlineTransactionSettings.container',
  () => ({ DeadlineTransactionSettings: () => null }),
)

// ─── Common leaf UI / hooks ────────────────────────────────────────────────────

jest.mock('common/pure/CurrencyInputPanel', () => ({ CurrencyInputPanel: () => null }))
jest.mock('common/pure/CurrencyArrowSeparator', () => ({ CurrencyArrowSeparator: () => null }))
jest.mock('common/pure/PoweredFooter', () => ({ PoweredFooter: () => null }))
jest.mock('common/hooks/useIsProviderNetworkUnsupported', () => ({ useIsProviderNetworkUnsupported: () => false }))
jest.mock('common/hooks/useIsProviderNetworkDeprecated', () => ({ useIsProviderNetworkDeprecated: () => false }))

// ─── SwapWidget local hooks / child containers ─────────────────────────────────

jest.mock('../../hooks/useSwapDerivedState', () => ({
  useSwapDerivedState: () => ({
    inputCurrency: null,
    outputCurrency: null,
    inputCurrencyAmount: null,
    outputCurrencyAmount: null,
    inputCurrencyBalance: null,
    outputCurrencyBalance: null,
    inputCurrencyFiatAmount: null,
    outputCurrencyFiatAmount: null,
    recipient: null,
    recipientAddress: null,
    orderKind: 'sell',
    // isUnlocked=true prevents the lock screen from replacing the form.
    isUnlocked: true,
  }),
}))
jest.mock('../../hooks/useHasEnoughWrappedBalanceForSwap', () => ({
  useHasEnoughWrappedBalanceForSwap: () => false,
}))
jest.mock('../../hooks/useSwapWidgetActions', () => ({
  useSwapWidgetActions: () => ({
    onCurrencySelection: jest.fn(),
    onUserInput: jest.fn(),
    onSwitchTokens: jest.fn(),
    onChangeRecipient: jest.fn(),
  }),
}))
jest.mock('../../hooks/useUpdateSwapRawState', () => ({
  useUpdateSwapRawState: () => jest.fn(),
}))

jest.mock('../BottomBanners/BottomBanners.container', () => ({ BottomBanners: () => null }))
jest.mock('../SwapConfirmModal', () => ({ SwapConfirmModal: () => null }))
jest.mock('../SwapDebugPanel', () => ({ SwapDebugPanel: () => null }))
jest.mock('../SwapRateDetails', () => ({ SwapRateDetails: () => null }))
jest.mock('../TradeButtons', () => ({ TradeButtons: () => null }))
jest.mock('../Warnings', () => ({ Warnings: () => null }))
jest.mock('../../pure/CrossChainUnlockScreen', () => ({ CrossChainUnlockScreen: () => null }))

// ─── Test ──────────────────────────────────────────────────────────────────────

function renderSwapWidget(): ReturnType<typeof render> {
  // A fresh jotai store per render isolates the persisted swapSettingsAtom.
  const store = createStore()
  const queryClient = new QueryClient()

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ReduxProvider store={cowSwapStore}>
          <I18nProvider i18n={i18n}>
            <ThemeProvider theme={getCowswapTheme(false)}>
              <JotaiProvider store={store}>
                <SwapWidget />
              </JotaiProvider>
            </ThemeProvider>
          </I18nProvider>
        </ReduxProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('SwapWidget — Custom Recipient toggle', () => {
  beforeEach(() => {
    // swapSettingsAtom is persisted; clear storage so showRecipient starts false.
    localStorage.clear()
    sessionStorage.clear()
  })

  it('shows the recipient input after enabling "Custom Recipient" in settings', async () => {
    const { container } = renderSwapWidget()

    // Recipient input is hidden by default.
    expect(screen.queryByTestId('set-recipient')).toBeNull()

    // Open the settings dropdown (Reach Menu opens on mousedown).
    const settingsButton = container.querySelector('#open-settings-dialog-button') as HTMLElement
    expect(settingsButton).not.toBeNull()
    fireEvent.mouseDown(settingsButton)

    // The "Custom Recipient" toggle becomes visible once the menu is open.
    await waitFor(() => expect(screen.getByText('Custom Recipient')).toBeTruthy())

    // Toggle it on.
    const recipientToggle = container.querySelector(
      '#toggle-recipient-mode-button input[type="checkbox"]',
    ) as HTMLInputElement
    expect(recipientToggle).not.toBeNull()
    expect(recipientToggle.checked).toBe(false)

    fireEvent.click(recipientToggle)

    // The recipient input (SetRecipient) is now rendered inside the form.
    await waitFor(() => expect(screen.getByTestId('set-recipient')).toBeTruthy())
  })

  it('keeps the recipient input hidden while the toggle stays off', async () => {
    const { container } = renderSwapWidget()

    // Open the settings dropdown without toggling anything.
    fireEvent.mouseDown(container.querySelector('#open-settings-dialog-button') as HTMLElement)
    await waitFor(() => expect(screen.getByText('Custom Recipient')).toBeTruthy())

    // With the toggle left off, the recipient input must not be shown.
    expect(screen.queryByTestId('set-recipient')).toBeNull()
  })
})
