import { createStore } from 'jotai'
import { ReactNode } from 'react'

import { COW_TOKEN_TO_CHAIN, WETH_SEPOLIA } from '@cowprotocol/common-const'
import { OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount } from '@cowprotocol/currency'
import { WalletInfo, walletInfoAtom } from '@cowprotocol/wallet'

import { act, renderHook, waitFor } from '@testing-library/react'
import { JotaiTestProvider, WithMockedWeb3 } from 'test-utils'
import { bridgingSdk } from 'tradingSdk/bridgingSdk'

import { LimitOrdersDerivedState, limitOrdersDerivedStateAtom } from 'modules/limitOrders/state/limitOrdersRawStateAtom'
import { DEFAULT_TRADE_DERIVED_STATE } from 'modules/trade'

import { useEnoughAllowance } from 'common/hooks/useEnoughAllowance'
import { TradeType } from 'common/modules/tradeNavigation'
import { featureFlagsAtom, featureFlagsStatusAtom } from 'common/state/featureFlagsState'

import { useTradeQuotePolling } from './useTradeQuotePolling'

import { tradeTypeAtom } from '../../trade/state/tradeTypeAtom'
import { tradeQuoteCounterAtom } from '../state/tradeQuoteCounterAtom'
import { tradeQuoteInputAtom } from '../state/tradeQuoteInputAtom'

jest.mock('modules/zeroApproval/hooks/useZeroApprovalState')
jest.mock('common/hooks/useGetMarketDimension')
jest.mock('common/hooks/useEnoughAllowance', () => ({
  ...jest.requireActual('common/hooks/useEnoughAllowance'),
  useEnoughAllowance: jest.fn().mockReturnValue(undefined),
}))
jest.mock('@cowprotocol/common-hooks', () => ({
  ...jest.requireActual('@cowprotocol/common-hooks'),
  useIsWindowVisible: jest.fn().mockReturnValue(true),
}))

jest.mock('../utils/getBridgeQuoteSigner', () => {
  const { privateKeyToAccount } = require('viem/accounts') as typeof import('viem/accounts')
  const bridgeQuoteSigner = privateKeyToAccount('0x1111111111111111111111111111111111111111111111111111111111111111')

  return {
    BRIDGE_QUOTE_ACCOUNT: bridgeQuoteSigner.address,
    COW_QUOTE_BTC_BRIDGE_RECIPIENT: 'bc1q5eapy5ptdr98vtx9c5pfaa2yd20ncd3n397ek4',
    COW_QUOTE_SOL_BRIDGE_RECIPIENT: 'F2nKBvD1yak1zvvGSdZdBmjKraCQX2gE14rA12Wqt23b',
    NON_EVM_CHAIN_CONFIG: [],
    isNonEvmPlaceholderRecipient: jest.fn().mockReturnValue(false),
    getBridgeQuoteSigner: jest.fn().mockReturnValue({
      ...bridgeQuoteSigner,
      getAddress: () => bridgeQuoteSigner.address,
    }),
  }
})

jest.mock('tradingSdk/bridgingSdk', () => ({
  bridgingSdk: {
    getQuote: jest.fn(),
    getBestQuote: jest.fn(),
  },
}))

jest.mock('wagmi', () => ({
  ...jest.requireActual('wagmi'),
  useWalletClient: jest.fn().mockReturnValue({ data: {} }),
}))

jest.mock('@cowprotocol/wallet', () => ({
  ...jest.requireActual('@cowprotocol/wallet'),
  useSolanaWalletProvider: jest.fn().mockReturnValue(undefined),
}))

const useEnoughAllowanceMock = useEnoughAllowance as jest.Mock

const bridgingSdkMock = bridgingSdk as unknown as { getQuote: jest.Mock }

const inputCurrencyAmount = CurrencyAmount.fromRawAmount(WETH_SEPOLIA, 10_000_000)

if (!COW_TOKEN_TO_CHAIN[SupportedChainId.SEPOLIA]) {
  throw new Error(`COW token not found for chain ${SupportedChainId.SEPOLIA}`)
}

const outputCurrencyAmount = CurrencyAmount.fromRawAmount(COW_TOKEN_TO_CHAIN[SupportedChainId.SEPOLIA], 2_000_000)

const walletInfoMock: WalletInfo = {
  chainId: 1,
  account: '0x333333f332a06ecb5d20d35da44ba07986d6e203',
  active: true,
}

const limitOrdersDerivedStateMock: LimitOrdersDerivedState = {
  ...DEFAULT_TRADE_DERIVED_STATE,
  inputCurrency: inputCurrencyAmount.currency,
  outputCurrency: outputCurrencyAmount.currency,
  inputCurrencyAmount,
  outputCurrencyAmount,
  isUnlocked: true,
}

const jotaiMock = [
  [featureFlagsStatusAtom, 'ready'],
  [tradeQuoteInputAtom, { amount: inputCurrencyAmount, orderKind: OrderKind.SELL }],
  [limitOrdersDerivedStateAtom, limitOrdersDerivedStateMock],
  [tradeTypeAtom, { tradeType: TradeType.LIMIT_ORDER, route: '' }],
]

const Wrapper =
  // TODO: Replace any with proper type definitions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (mocks: any, store?: ReturnType<typeof createStore>) =>
    ({ children }: { children: ReactNode }) => (
      <WithMockedWeb3 location={{ pathname: '/5/limit' }}>
        <JotaiTestProvider initialValues={mocks} store={store}>
          {children}
        </JotaiTestProvider>
      </WithMockedWeb3>
    )

describe('useTradeQuotePolling()', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    bridgingSdkMock.getQuote.mockImplementation(() => new Promise(() => void 0))

    useEnoughAllowanceMock.mockReturnValue(true)
  })

  describe('When wallet is connected', () => {
    it('Then should put account address into "receiver" field in the quote request', async () => {
      // Arrange
      const mocks = [...jotaiMock, [walletInfoAtom, walletInfoMock]]

      // Act
      renderHook(
        () => {
          return useTradeQuotePolling({
            isConfirmOpen: false,
            isQuoteUpdatePossible: true,
            useSuggestedSlippageApi: false,
            hasPendingTrade: false,
          })
        },
        { wrapper: Wrapper(mocks) },
      )

      // Wait for Web3ReactProvider to finish initializing and getQuote to be called
      await waitFor(() => {
        expect(bridgingSdkMock.getQuote).toHaveBeenCalled()
      })

      // Assert
      const callParams = bridgingSdkMock.getQuote.mock.calls[0]

      expect(callParams[0].receiver).toBe(walletInfoMock.account) // useAddress field value
      expect(bridgingSdkMock.getQuote).toHaveBeenCalledTimes(1)
      expect(callParams).toMatchSnapshot()
    })
  })

  it('does not tick the polling counter while CAPTCHA blocks quoting', () => {
    jest.useFakeTimers()
    const previousSiteKey = process.env.REACT_APP_TURNSTILE_SITE_KEY
    process.env.REACT_APP_TURNSTILE_SITE_KEY = 'site-key'

    try {
      const store = createStore()
      const initialCounter = 5_000
      const mocks = [
        ...jotaiMock,
        [featureFlagsAtom, { isCaptchaEnabled: true }],
        [tradeQuoteCounterAtom, initialCounter],
      ]

      renderHook(
        () =>
          useTradeQuotePolling({
            isConfirmOpen: false,
            isQuoteUpdatePossible: true,
            useSuggestedSlippageApi: false,
            hasPendingTrade: false,
          }),
        { wrapper: Wrapper(mocks, store) },
      )

      const frozenCounter = store.get(tradeQuoteCounterAtom)

      act(() => jest.advanceTimersByTime(2_000))

      expect(store.get(tradeQuoteCounterAtom)).toBe(frozenCounter)
    } finally {
      if (previousSiteKey === undefined) delete process.env.REACT_APP_TURNSTILE_SITE_KEY
      else process.env.REACT_APP_TURNSTILE_SITE_KEY = previousSiteKey
      jest.useRealTimers()
    }
  })

  describe('When wallet is NOT connected', () => {
    it('Then the "receiver" field in the quote request should be undefined', async () => {
      // Arrange
      const mocks = [...jotaiMock, [walletInfoAtom, { ...walletInfoMock, account: undefined }]]

      // Act
      renderHook(
        () =>
          useTradeQuotePolling({
            isConfirmOpen: false,
            isQuoteUpdatePossible: true,
            useSuggestedSlippageApi: false,
            hasPendingTrade: false,
          }),
        { wrapper: Wrapper(mocks) },
      )

      // Wait for Web3ReactProvider to finish initializing and getQuote to be called
      await waitFor(() => {
        expect(bridgingSdkMock.getQuote).toHaveBeenCalled()
      })

      // Assert
      const { signer: _, ...callParams } = bridgingSdkMock.getQuote.mock.calls[0][0]

      expect(callParams.receiver).toBe(undefined) // useAddress field value
      expect(bridgingSdkMock.getQuote).toHaveBeenCalledTimes(1)
      expect(callParams).toMatchSnapshot()
    })
  })
})
