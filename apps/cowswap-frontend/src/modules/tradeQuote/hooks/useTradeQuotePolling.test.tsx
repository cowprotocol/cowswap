import { ReactNode } from 'react'

import { CurrencyAmount } from '@uniswap/sdk-core'

import { renderHook } from '@testing-library/react-hooks'
import { JotaiTestProvider, WithMockedWeb3 } from 'test-utils'

import { COW } from 'legacy/constants/tokens'
import { WETH_GOERLI } from 'legacy/utils/goerli/constants'

import { limitOrdersDerivedStateAtom } from 'modules/limitOrders'
import { useEnoughBalanceAndAllowance } from 'modules/tokens'
import { DEFAULT_TRADE_DERIVED_STATE, TradeType, useTradeTypeInfo } from 'modules/trade'
import { walletInfoAtom } from 'modules/wallet/api/state'

import { getQuote } from 'api/gnosisProtocol/api'
import { Routes } from 'common/constants/routes'

import { useTradeQuotePolling } from './useTradeQuotePolling'

import { tradeQuoteParamsAtom } from '../state/tradeQuoteParamsAtom'

jest.mock('common/hooks/useShouldZeroApprove/useShouldZeroApprove')
jest.mock('legacy/components/analytics/hooks/useGetMarketDimension')

jest.mock('api/gnosisProtocol/api', () => ({
  ...jest.requireActual('api/gnosisProtocol/api'),
  getQuote: jest.fn(),
}))

jest.mock('modules/trade/hooks/useTradeTypeInfo', () => ({
  ...jest.requireActual('modules/trade/hooks/useTradeTypeInfo'),
  useTradeTypeInfo: jest.fn(),
}))

jest.mock('modules/tokens', () => ({
  ...jest.requireActual('modules/tokens'),
  useEnoughBalanceAndAllowance: jest.fn(),
}))

const getQuoteMock = jest.mocked(getQuote)
const useTradeTypeInfoMock = jest.mocked(useTradeTypeInfo)
const useEnoughBalanceAndAllowanceMock = jest.mocked(useEnoughBalanceAndAllowance)

const inputCurrencyAmount = CurrencyAmount.fromRawAmount(WETH_GOERLI, 10_000_000)
const outputCurrencyAmount = CurrencyAmount.fromRawAmount(COW[5], 2_000_000)

const walletInfoMock = {
  chainId: 1,
  account: '0x333333f332a06ecb5d20d35da44ba07986d6e203',
  active: true,
}
const limitOrdersDerivedStateMock = {
  ...DEFAULT_TRADE_DERIVED_STATE,
  inputCurrency: inputCurrencyAmount.currency,
  outputCurrency: outputCurrencyAmount.currency,
  inputCurrencyAmount,
  outputCurrencyAmount,
  isUnlocked: true,
}

const jotaiMock = [
  [tradeQuoteParamsAtom, { amount: inputCurrencyAmount }],
  [limitOrdersDerivedStateAtom, limitOrdersDerivedStateMock],
]

const Wrapper =
  (mocks: any) =>
  ({ children }: { children: ReactNode }) =>
    (
      <WithMockedWeb3>
        <JotaiTestProvider initialValues={mocks}>{children}</JotaiTestProvider>
      </WithMockedWeb3>
    )

describe('useTradeQuotePolling()', () => {
  beforeEach(() => {
    getQuoteMock.mockReturnValue(new Promise(() => void 0))
    useTradeTypeInfoMock.mockReturnValue({
      tradeType: TradeType.LIMIT_ORDER,
      route: Routes.LIMIT_ORDER,
    })
    useEnoughBalanceAndAllowanceMock.mockReturnValue(true)
  })

  describe('When wallet is connected', () => {
    it('Then should put account address into "useAddress" field in the quote request', () => {
      // Arrange
      const mocks = [...jotaiMock, [walletInfoAtom, walletInfoMock]]

      // Act
      renderHook(() => useTradeQuotePolling(), { wrapper: Wrapper(mocks) })

      // Assert
      const callParams = getQuoteMock.mock.calls[0][0]

      expect(callParams.userAddress).toBe(walletInfoMock.account) // useAddress field value
      expect(getQuoteMock).toHaveBeenCalledTimes(1)
      expect(callParams).toMatchSnapshot()
    })
  })

  describe('When wallet is NOT connected', () => {
    it('Then  the "useAddress" field in the quote request should be 0x000...0000', () => {
      // Arrange
      const mocks = [...jotaiMock, [walletInfoAtom, { ...walletInfoMock, account: undefined }]]

      // Act
      renderHook(() => useTradeQuotePolling(), { wrapper: Wrapper(mocks) })

      // Assert
      const callParams = getQuoteMock.mock.calls[0][0]

      expect(callParams.userAddress).toBe(undefined) // useAddress field value
      expect(getQuoteMock).toHaveBeenCalledTimes(1)
      expect(callParams).toMatchSnapshot()
    })
  })
})
