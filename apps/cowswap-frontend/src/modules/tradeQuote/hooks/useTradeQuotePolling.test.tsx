import { ReactNode } from 'react'

import { COW_TOKEN_TO_CHAIN, WETH_SEPOLIA } from '@cowprotocol/common-const'
import { OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'
import { WalletInfo, walletInfoAtom } from '@cowprotocol/wallet'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { renderHook, waitFor } from '@testing-library/react'
import { JotaiTestProvider, WithMockedWeb3 } from 'test-utils'
import { bridgingSdk } from 'tradingSdk/bridgingSdk'

import { LimitOrdersDerivedState, limitOrdersDerivedStateAtom } from 'modules/limitOrders/state/limitOrdersRawStateAtom'
import { DEFAULT_TRADE_DERIVED_STATE, TradeType } from 'modules/trade'

import { useEnoughAllowance } from 'common/hooks/useEnoughAllowance'

import { useTradeQuotePolling } from './useTradeQuotePolling'

import { tradeTypeAtom } from '../../trade/state/tradeTypeAtom'
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
jest.mock('@cowprotocol/wallet-provider', () => ({
  ...jest.requireActual('@cowprotocol/wallet-provider'),
  useWalletProvider: jest.fn().mockReturnValue({
    provider: {},
    getSigner() {
      return {}
    },
  }),
}))

jest.mock('tradingSdk/bridgingSdk', () => ({
  bridgingSdk: {
    getQuote: jest.fn(),
    getBestQuote: jest.fn(),
  },
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
  [tradeQuoteInputAtom, { amount: inputCurrencyAmount, orderKind: OrderKind.SELL }],
  [limitOrdersDerivedStateAtom, limitOrdersDerivedStateMock],
  [tradeTypeAtom, { tradeType: TradeType.LIMIT_ORDER, route: '' }],
]

const Wrapper =
  // TODO: Replace any with proper type definitions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (mocks: any) =>
    ({ children }: { children: ReactNode }) => (
      <WithMockedWeb3 location={{ pathname: '/5/limit' }}>
        <JotaiTestProvider initialValues={mocks}>{children}</JotaiTestProvider>
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
          })
        },
        { wrapper: Wrapper(mocks) },
      )

      // Wait for Web3ReactProvider to finish initializing and getQuote to be called
      // waitFor already handles act() internally
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
          }),
        { wrapper: Wrapper(mocks) },
      )

      // Wait for Web3ReactProvider to finish initializing and getQuote to be called
      // waitFor already handles act() internally
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
