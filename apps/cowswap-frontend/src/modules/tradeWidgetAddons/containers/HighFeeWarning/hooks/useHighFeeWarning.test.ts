import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Token } from '@cowprotocol/currency'

import { renderHook } from '@testing-library/react'

import { ReceiveAmountInfo, useGetReceiveAmountInfo } from 'modules/trade'

import { useHighFeeWarning } from './useHighFeeWarning'

import { useTradeConfirmState } from '../../../../trade/hooks/useTradeConfirmState'

// Keep the real freeze hook so this covers the actual composition, and mock only the two seams:
// the live quote and the confirm state that drives freezing.
jest.mock('modules/trade', () => ({
  useGetReceiveAmountInfo: jest.fn(),
  useFreezeWhileConfirming: jest.requireActual('../../../../trade/hooks/useFreezeWhileConfirming')
    .useFreezeWhileConfirming,
}))

jest.mock('../../../../trade/hooks/useTradeConfirmState', () => ({
  useTradeConfirmState: jest.fn(),
}))

const mockedUseGetReceiveAmountInfo = useGetReceiveAmountInfo as jest.MockedFunction<typeof useGetReceiveAmountInfo>
const mockedUseTradeConfirmState = useTradeConfirmState as jest.MockedFunction<typeof useTradeConfirmState>

const USDC = new Token(SupportedChainId.MAINNET, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC', 'USD Coin')
const WETH = new Token(
  SupportedChainId.MAINNET,
  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  18,
  'WETH',
  'Wrapped Ether',
)

const ONE_WETH = CurrencyAmount.fromRawAmount(WETH, '1000000000000000000')
const ZERO_WETH = CurrencyAmount.fromRawAmount(WETH, '0')
const ZERO_USDC = CurrencyAmount.fromRawAmount(USDC, '0')

/**
 * Sell order buying 1 WETH, with `networkFeeInBuyCurrency` charged on top, so the resulting
 * warning percentage is simply that fee expressed against 1 WETH.
 */
function buildReceiveAmountInfo(networkFeeInBuyCurrency: string): ReceiveAmountInfo {
  const currencies = { sellAmount: ZERO_USDC, buyAmount: ONE_WETH }

  return {
    isSell: true,
    quotePrice: null as never,
    costs: {
      networkFee: {
        amountInSellCurrency: ZERO_USDC,
        amountInBuyCurrency: CurrencyAmount.fromRawAmount(WETH, networkFeeInBuyCurrency),
      },
      partnerFee: { amount: ZERO_WETH, bps: 0 },
    },
    beforeAllFees: currencies,
    beforeNetworkCosts: currencies,
    afterNetworkCosts: currencies,
    afterPartnerFees: currencies,
    afterSlippage: currencies,
    amountsToSign: currencies,
  } as ReceiveAmountInfo
}

const QUOTE_34_PERCENT = buildReceiveAmountInfo('340000000000000000')
const QUOTE_50_PERCENT = buildReceiveAmountInfo('500000000000000000')

function mockIsConfirming(isConfirming: boolean): void {
  mockedUseTradeConfirmState.mockReturnValue({
    isOpen: true,
    pendingTrade: null,
    transactionHash: null,
    error: null,
    permitSignatureState: undefined,
    forcePriceConfirmation: false,
    isConfirming,
  } as ReturnType<typeof useTradeConfirmState>)
}

describe('useHighFeeWarning', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('follows the live quote while the user has not confirmed yet', () => {
    mockIsConfirming(false)
    mockedUseGetReceiveAmountInfo.mockReturnValue(QUOTE_34_PERCENT)

    const { result, rerender } = renderHook(() => useHighFeeWarning())

    expect(result.current.feePercentage?.toFixed(0)).toBe('34')

    mockedUseGetReceiveAmountInfo.mockReturnValue(QUOTE_50_PERCENT)
    rerender()

    expect(result.current.feePercentage?.toFixed(0)).toBe('50')
  })

  it('keeps the percentage of the confirmed quote when a refresh lands while confirming', () => {
    mockIsConfirming(false)
    mockedUseGetReceiveAmountInfo.mockReturnValue(QUOTE_34_PERCENT)

    const { result, rerender } = renderHook(() => useHighFeeWarning())

    expect(result.current.feePercentage?.toFixed(0)).toBe('34')

    // User clicks confirm, then a quote refresh lands while the wallet prompt is open.
    mockIsConfirming(true)
    mockedUseGetReceiveAmountInfo.mockReturnValue(QUOTE_50_PERCENT)
    rerender()

    expect(result.current.feePercentage?.toFixed(0)).toBe('34')
    expect(result.current.isHighFee).toBe(true)
  })

  it('resumes following the live quote once the confirm attempt is aborted', () => {
    mockIsConfirming(false)
    mockedUseGetReceiveAmountInfo.mockReturnValue(QUOTE_34_PERCENT)

    const { result, rerender } = renderHook(() => useHighFeeWarning())

    mockIsConfirming(true)
    mockedUseGetReceiveAmountInfo.mockReturnValue(QUOTE_50_PERCENT)
    rerender()

    expect(result.current.feePercentage?.toFixed(0)).toBe('34')

    mockIsConfirming(false)
    rerender()

    expect(result.current.feePercentage?.toFixed(0)).toBe('50')
  })
})
