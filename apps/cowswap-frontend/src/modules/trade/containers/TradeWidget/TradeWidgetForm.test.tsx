import React from 'react'

import { AdditionalTargetChainId } from '@cowprotocol/cow-sdk'
import { Currency } from '@cowprotocol/currency'
import { useIsSafeWallet, useIsSmartContractWallet, useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import { render, screen } from '@testing-library/react'

import { Field } from 'legacy/state/types'

import { CurrencyInfo } from 'common/pure/CurrencyInputPanel/types'

import { TradeWidgetForm } from './TradeWidgetForm'
import { TradeWidgetProps } from './types'

import { useTradeStateFromUrl } from '../../hooks/setupTradeState/useTradeStateFromUrl'
import { useIsCurrentTradeBridging } from '../../hooks/useIsCurrentTradeBridging'
import { useIsEoaEthFlow } from '../../hooks/useIsEoaEthFlow'
import { useIsNonEvmBridging } from '../../hooks/useIsNonEvmBridging'
import { useIsQuoteUpdatePossible } from '../../hooks/useIsQuoteUpdatePossible'
import { useIsWrapOrUnwrap } from '../../hooks/useIsWrapOrUnwrap'
import { useLimitOrdersPromoBanner } from '../../hooks/useLimitOrdersPromoBanner'
import { useShouldHideQuoteAmounts } from '../../hooks/useShouldHideQuoteAmounts'
import { useTradeTypeInfoFromUrl } from '../../hooks/useTradeTypeInfoFromUrl'
import { useIsAlternativeOrderModalVisible } from '../../state/alternativeOrder'

// ─── External package mocks ────────────────────────────────────────────────

jest.mock('@cowprotocol/common-hooks', () => ({
  useFeatureFlags: () => ({}),
  useTheme: () => ({ darkMode: false }),
  useMediaQuery: () => false,
  useThrottleFn: (fn: unknown) => fn,
}))

jest.mock('@cowprotocol/common-utils', () => ({
  ...jest.requireActual('@cowprotocol/common-utils'),
  isInjectedWidget: () => false,
  isSellOrder: () => true,
  maxAmountSpend: () => null,
}))

jest.mock('@cowprotocol/cow-sdk', () => ({
  ...jest.requireActual('@cowprotocol/cow-sdk'),
  isEvmChain: (chainId: number) => chainId === 1 || chainId === 100,
}))

jest.mock('@cowprotocol/wallet', () => ({
  useWalletInfo: jest.fn(),
  useWalletDetails: jest.fn(),
  useIsSafeWallet: jest.fn(),
  useIsSmartContractWallet: jest.fn(),
}))

jest.mock('@cowprotocol/ui', () => ({
  ButtonOutlined: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Media: { upToSmall: () => '', upToLarge: () => '' },
  MY_ORDERS_ID: 'my-orders',
  SWAP_HEADER_OFFSET: 0,
}))

// ─── Module mocks ──────────────────────────────────────────────────────────

jest.mock('modules/account', () => ({ useToggleAccountModal: () => jest.fn() }))
jest.mock('modules/injectedWidget', () => ({ useInjectedWidgetParams: () => ({}) }))
jest.mock('modules/tokensList', () => ({ useOpenTokenSelectWidget: () => jest.fn() }))
jest.mock('modules/trade', () => ({
  useDerivedTradeState: () => ({ orderKind: 'sell' }),
  useSetNonEvmReceiverConfirmed: () => jest.fn(),
}))
jest.mock('modules/tradeFormValidation', () => ({
  useGetTradeFormValidation: () => null,
  TradeFormValidation: {},
}))

// ─── Internal hook mocks ───────────────────────────────────────────────────

jest.mock('../../hooks/useIsCurrentTradeBridging', () => ({ useIsCurrentTradeBridging: jest.fn() }))
jest.mock('../../hooks/useIsNonEvmBridging', () => ({ useIsNonEvmBridging: jest.fn() }))
jest.mock('../../hooks/useResetReceiverConfirmationOnWalletChange', () => ({
  useResetReceiverConfirmationOnWalletChange: jest.fn(),
}))
jest.mock('../../hooks/useIsEoaEthFlow', () => ({ useIsEoaEthFlow: jest.fn() }))
jest.mock('../../hooks/useIsQuoteUpdatePossible', () => ({ useIsQuoteUpdatePossible: jest.fn() }))
jest.mock('../../hooks/useIsWrapOrUnwrap', () => ({ useIsWrapOrUnwrap: jest.fn() }))
jest.mock('../../hooks/useLimitOrdersPromoBanner', () => ({ useLimitOrdersPromoBanner: jest.fn() }))
jest.mock('../../hooks/useShouldHideQuoteAmounts', () => ({ useShouldHideQuoteAmounts: jest.fn() }))
jest.mock('../../hooks/setupTradeState/useTradeStateFromUrl', () => ({ useTradeStateFromUrl: jest.fn() }))
jest.mock('../../hooks/useTradeTypeInfoFromUrl', () => ({ useTradeTypeInfoFromUrl: jest.fn() }))
jest.mock('../../state/alternativeOrder', () => ({
  useIsAlternativeOrderModalVisible: jest.fn(),
  alternativeOrderReadWriteAtomFactory: (regular: unknown) => regular,
  alternativeOrderAtomSetterFactory: (regular: unknown) => regular,
}))

// ─── Child component mocks ─────────────────────────────────────────────────

jest.mock('../../pure/SetRecipient', () => ({
  SetRecipient: () => <div data-testid="set-recipient" />,
}))

jest.mock('common/pure/CurrencyInputPanel', () => ({
  CurrencyInputPanel: () => null,
}))

jest.mock('common/pure/CurrencyArrowSeparator', () => ({
  CurrencyArrowSeparator: () => null,
}))

jest.mock('common/pure/PoweredFooter', () => ({ PoweredFooter: () => null }))

jest.mock('../../containers/LimitOrdersPromoBannerWrapper', () => ({
  LimitOrdersPromoBannerWrapper: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

jest.mock('../../containers/QuotePolingProgress', () => ({ QuotePolingProgress: () => null }))
jest.mock('../../containers/TradeWarnings', () => ({ TradeWarnings: () => null }))
jest.mock('../../containers/TradeWidgetLinks', () => ({ TradeWidgetLinks: () => null }))
jest.mock('../../containers/WrapFlowActionButton', () => ({ WrapFlowActionButton: () => null }))

jest.mock('common/hooks/useIsProviderNetworkUnsupported', () => ({
  useIsProviderNetworkUnsupported: () => false,
}))
jest.mock('common/hooks/useIsProviderNetworkDeprecated', () => ({
  useIsProviderNetworkDeprecated: () => false,
}))
jest.mock('./styled', () => ({
  ContainerBox: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Header: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  HeaderRight: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CurrencySeparatorBox: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  OuterContentWrapper: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

jest.mock('./TradeWidgetForm.utils', () => ({ mapCurrencyInfo: (info: unknown) => info }))

jest.mock('modules/wallet', () => ({ WalletStatusButton: () => null }))

// ─── Typed mock references ─────────────────────────────────────────────────

const mockedUseWalletInfo = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const mockedUseWalletDetails = useWalletDetails as jest.MockedFunction<typeof useWalletDetails>
const mockedUseIsSafeWallet = useIsSafeWallet as jest.MockedFunction<typeof useIsSafeWallet>
const mockedUseIsSmartContractWallet = useIsSmartContractWallet as jest.MockedFunction<typeof useIsSmartContractWallet>
const mockedUseIsWrapOrUnwrap = useIsWrapOrUnwrap as jest.MockedFunction<typeof useIsWrapOrUnwrap>
const mockedUseIsCurrentTradeBridging = useIsCurrentTradeBridging as jest.MockedFunction<
  typeof useIsCurrentTradeBridging
>
const mockedUseIsNonEvmBridging = useIsNonEvmBridging as jest.MockedFunction<typeof useIsNonEvmBridging>
const mockedUseTradeStateFromUrl = useTradeStateFromUrl as jest.MockedFunction<typeof useTradeStateFromUrl>
const mockedUseLimitOrdersPromoBanner = useLimitOrdersPromoBanner as jest.MockedFunction<
  typeof useLimitOrdersPromoBanner
>

// ─── Helpers ───────────────────────────────────────────────────────────────

const EVM_CHAIN_ID = 1
const BTC_CHAIN_ID = AdditionalTargetChainId.BITCOIN
const ACCOUNT = '0xabc'

function makeCurrencyInfo(chainId?: number): CurrencyInfo {
  return {
    field: Field.OUTPUT,
    currency: chainId !== undefined ? ({ chainId } as unknown as Currency) : null,
    amount: null,
    isIndependent: false,
    balance: null,
    fiatAmount: null,
    receiveAmountInfo: null,
  }
}

function buildProps(overrides: Partial<TradeWidgetProps> = {}): TradeWidgetProps {
  return {
    slots: { settingsWidget: null },
    actions: {
      onCurrencySelection: jest.fn(),
      onUserInput: jest.fn(),
      onSwitchTokens: jest.fn(),
      onChangeRecipient: jest.fn(),
    },
    params: {
      compactView: false,
      showRecipient: false,
      isTradePriceUpdating: false,
      priceImpact: { priceImpact: undefined, loading: false },
    },
    inputCurrencyInfo: makeCurrencyInfo(),
    outputCurrencyInfo: makeCurrencyInfo(),
    ...overrides,
  }
}

function setupDefaults({
  account = undefined as string | undefined,
  isWrapOrUnwrap = false,
  isBridging = false,
  isNonEvmBridging = false,
  isSmartContractWallet = false as boolean | undefined,
  recipientInUrl = null as string | null,
} = {}): void {
  mockedUseWalletInfo.mockReturnValue({ account, chainId: EVM_CHAIN_ID } as ReturnType<typeof useWalletInfo>)
  mockedUseWalletDetails.mockReturnValue({ allowsOffchainSigning: !isSmartContractWallet } as ReturnType<
    typeof useWalletDetails
  >)
  mockedUseIsSafeWallet.mockReturnValue(false)
  mockedUseIsSmartContractWallet.mockReturnValue(isSmartContractWallet)
  mockedUseIsWrapOrUnwrap.mockReturnValue(isWrapOrUnwrap)
  mockedUseIsCurrentTradeBridging.mockReturnValue(isBridging)
  mockedUseIsNonEvmBridging.mockReturnValue(isNonEvmBridging)
  mockedUseTradeStateFromUrl.mockReturnValue(
    recipientInUrl ? ({ recipient: recipientInUrl } as never) : (null as never),
  )
  mockedUseLimitOrdersPromoBanner.mockReturnValue({ shouldBeVisible: false } as never)
  ;(useIsAlternativeOrderModalVisible as jest.Mock).mockReturnValue(false)
  ;(useTradeTypeInfoFromUrl as jest.Mock).mockReturnValue(null)
  ;(useIsEoaEthFlow as jest.Mock).mockReturnValue(false)
  ;(useIsQuoteUpdatePossible as jest.Mock).mockReturnValue(false)
  ;(useShouldHideQuoteAmounts as jest.Mock).mockReturnValue(false)
}

function renderWithI18n(ui: React.ReactElement): ReturnType<typeof render> {
  return render(<I18nProvider i18n={i18n}>{ui}</I18nProvider>)
}

// ─── Tests ─────────────────────────────────────────────────────────────────

describe('TradeWidgetForm — withRecipient visibility', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('wrap/unwrap — always hidden', () => {
    it('hides SetRecipient even with showRecipient=true', () => {
      setupDefaults({ account: ACCOUNT, isWrapOrUnwrap: true })

      renderWithI18n(<TradeWidgetForm {...buildProps({ params: { ...buildProps().params, showRecipient: true } })} />)

      expect(screen.queryByTestId('set-recipient')).toBeNull()
    })
  })

  describe('toggle — shown when on, hidden when off (EOA, SC wallet, any EVM)', () => {
    it('shows when showRecipient=true without a connected account', () => {
      setupDefaults({ account: undefined })

      renderWithI18n(<TradeWidgetForm {...buildProps({ params: { ...buildProps().params, showRecipient: true } })} />)

      expect(screen.getByTestId('set-recipient')).toBeTruthy()
    })

    it('shows when showRecipient=true with a connected account', () => {
      setupDefaults({ account: ACCOUNT })

      renderWithI18n(<TradeWidgetForm {...buildProps({ params: { ...buildProps().params, showRecipient: true } })} />)

      expect(screen.getByTestId('set-recipient')).toBeTruthy()
    })

    it('hides when showRecipient=false for EVM swap (connected)', () => {
      setupDefaults({ account: ACCOUNT })

      renderWithI18n(<TradeWidgetForm {...buildProps()} />)

      expect(screen.queryByTestId('set-recipient')).toBeNull()
    })

    it('hides when showRecipient=false for EVM bridge with SC wallet', () => {
      setupDefaults({ account: ACCOUNT, isBridging: true, isSmartContractWallet: true })

      renderWithI18n(<TradeWidgetForm {...buildProps({ outputCurrencyInfo: makeCurrencyInfo(EVM_CHAIN_ID) })} />)

      expect(screen.queryByTestId('set-recipient')).toBeNull()
    })
  })

  describe('non-EVM bridge — always shown regardless of toggle or wallet connection', () => {
    it('shows when connected and toggle is off', () => {
      setupDefaults({ account: ACCOUNT, isBridging: true, isNonEvmBridging: true })

      renderWithI18n(<TradeWidgetForm {...buildProps({ outputCurrencyInfo: makeCurrencyInfo(BTC_CHAIN_ID) })} />)

      expect(screen.getByTestId('set-recipient')).toBeTruthy()
    })

    it('shows when disconnected and toggle is off', () => {
      setupDefaults({ account: undefined, isBridging: true, isNonEvmBridging: true })

      renderWithI18n(<TradeWidgetForm {...buildProps({ outputCurrencyInfo: makeCurrencyInfo(BTC_CHAIN_ID) })} />)

      expect(screen.getByTestId('set-recipient')).toBeTruthy()
    })
  })

  describe('recipient in URL — always shown', () => {
    it('shows even without a connected account', () => {
      setupDefaults({ account: undefined, recipientInUrl: '0xrecipient' })

      renderWithI18n(<TradeWidgetForm {...buildProps()} />)

      expect(screen.getByTestId('set-recipient')).toBeTruthy()
    })
  })
})
