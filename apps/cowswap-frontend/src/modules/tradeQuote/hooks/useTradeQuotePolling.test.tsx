import { ReactNode } from 'react'

import { COW, WETH_SEPOLIA, ZERO_ADDRESS } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { WalletInfo, walletInfoAtom } from '@cowprotocol/wallet'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { renderHook } from '@testing-library/react-hooks'
import { orderBookApi } from 'cowSdk'
import { JotaiTestProvider, WithMockedWeb3 } from 'test-utils'

import { LimitOrdersDerivedState, limitOrdersDerivedStateAtom } from 'modules/limitOrders/state/limitOrdersRawStateAtom'
import * as tokensModule from 'modules/tokens'
import { DEFAULT_TRADE_DERIVED_STATE } from 'modules/trade'

import { useTradeQuotePolling } from './useTradeQuotePolling'

import { tradeQuoteParamsAtom } from '../state/tradeQuoteParamsAtom'

jest.mock('modules/zeroApproval/hooks/useZeroApprovalState')
jest.mock('common/hooks/useGetMarketDimension')

const getQuoteMock = jest.spyOn(orderBookApi, 'getQuote')
const useEnoughBalanceAndAllowanceMock = jest.spyOn(tokensModule, 'useEnoughBalanceAndAllowance')

const inputCurrencyAmount = CurrencyAmount.fromRawAmount(WETH_SEPOLIA, 10_000_000)
const outputCurrencyAmount = CurrencyAmount.fromRawAmount(COW[SupportedChainId.SEPOLIA], 2_000_000)

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
  [tradeQuoteParamsAtom, { amount: inputCurrencyAmount }],
  [limitOrdersDerivedStateAtom, limitOrdersDerivedStateMock],
]

const Wrapper =
  (mocks: any) =>
  ({ children }: { children: ReactNode }) =>
    (
      <WithMockedWeb3 location={{ pathname: '/5/limit' }}>
        <JotaiTestProvider initialValues={mocks}>{children}</JotaiTestProvider>
      </WithMockedWeb3>
    )

describe('useTradeQuotePolling()', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    getQuoteMock.mockImplementation(() => new Promise(() => void 0))
    useEnoughBalanceAndAllowanceMock.mockReturnValue({ enoughBalance: true, enoughAllowance: true })
  })

  describe('When wallet is connected', () => {
    it('Then should put account address into "useAddress" field in the quote request', () => {
      // Arrange
      const mocks = [...jotaiMock, [walletInfoAtom, walletInfoMock]]

      // Act
      renderHook(() => useTradeQuotePolling(), { wrapper: Wrapper(mocks) })

      // Assert
      const callParams = getQuoteMock.mock.calls[0][0]

      expect(callParams.from).toBe(walletInfoMock.account) // useAddress field value
      expect(getQuoteMock).toHaveBeenCalledTimes(1)
      expect(callParams).toMatchSnapshot()
    })
  })

  describe('When wallet is NOT connected', () => {
    it('Then the "useAddress" field in the quote request should be 0x000...0000', () => {
      // Arrange
      const mocks = [...jotaiMock, [walletInfoAtom, { ...walletInfoMock, account: undefined }]]

      // Act
      renderHook(() => useTradeQuotePolling(), { wrapper: Wrapper(mocks) })

      // Assert
      const callParams = getQuoteMock.mock.calls[0][0]

      expect(callParams.from).toBe(ZERO_ADDRESS) // useAddress field value
      expect(getQuoteMock).toHaveBeenCalledTimes(1)
      expect(callParams).toMatchSnapshot()
    })
  })
})
