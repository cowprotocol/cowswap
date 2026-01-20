import { TokenWithLogo, USDC_BASE, USDT_BNB } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useTryFindToken } from '@cowprotocol/tokens'

import { renderHook } from '@testing-library/react'

import { useTradeQuote } from 'modules/tradeQuote'
import { TradeQuoteState } from 'modules/tradeQuote/state/tradeQuoteAtom'

import { getBridgeIntermediateTokenAddress } from 'common/utils/getBridgeIntermediateTokenAddress'

import { useDerivedTradeState } from './useDerivedTradeState'
import { useEstimatedBridgeBuyAmount } from './useEstimatedBridgeBuyAmount'

// Mock dependencies
jest.mock('@cowprotocol/tokens', () => ({
  useTryFindToken: jest.fn(),
}))

jest.mock('common/utils/getBridgeIntermediateTokenAddress', () => ({
  getBridgeIntermediateTokenAddress: jest.fn(),
}))

jest.mock('modules/tradeQuote', () => ({
  useTradeQuote: jest.fn(),
}))

jest.mock('./useDerivedTradeState', () => ({
  useDerivedTradeState: jest.fn(),
}))

const mockedUseTryFindToken = useTryFindToken as jest.MockedFunction<typeof useTryFindToken>
const mockedGetBridgeIntermediateTokenAddress = getBridgeIntermediateTokenAddress as jest.MockedFunction<
  typeof getBridgeIntermediateTokenAddress
>
const mockedUseTradeQuote = useTradeQuote as jest.MockedFunction<typeof useTradeQuote>
const mockedUseDerivedTradeState = useDerivedTradeState as jest.MockedFunction<typeof useDerivedTradeState>

// Test tokens
const intermediateCurrency = new TokenWithLogo(
  undefined,
  SupportedChainId.BNB,
  '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  18,
  'BNB',
  'BNB Chain Native Token',
)

// Test data
const bridgeSellAmountRaw = 5700201003969n // BNB amount
const bridgeBuyAmountRaw = 4694n // USDC amount (destination)
const swapBuyAmountRaw = 4229023151143298n // BNB amount (intermediate)
const feeAmountRaw = 100n // Fee in USDC

describe('useEstimatedBridgeBuyAmount', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Calculates correct bridge amounts', () => {
    it('should calculate estimated bridge amounts correctly', () => {
      const derivedState = {
        inputCurrency: USDT_BNB,
        outputCurrency: USDC_BASE,
      }

      mockedUseDerivedTradeState.mockReturnValue(derivedState as never)
      mockedUseTryFindToken.mockReturnValue({ token: intermediateCurrency } as never)
      mockedGetBridgeIntermediateTokenAddress.mockReturnValue('0xIntermediateAddress')

      mockedUseTradeQuote.mockReturnValue({
        bridgeQuote: {
          amountsAndCosts: {
            beforeFee: {
              sellAmount: bridgeSellAmountRaw,
              buyAmount: bridgeBuyAmountRaw,
            },
            costs: {
              bridgingFee: {
                amountInSellCurrency: feeAmountRaw,
              },
            },
          },
        },
        quote: {
          quoteResults: {
            amountsAndCosts: {
              afterPartnerFees: {
                buyAmount: swapBuyAmountRaw,
              },
            },
          },
        },
      } as TradeQuoteState)

      const { result } = renderHook(() => useEstimatedBridgeBuyAmount())

      expect(result.current).not.toBeNull()
      expect(result.current?.intermediateCurrency).toEqual(intermediateCurrency)

      // Verify expectedToReceiveAmount calculation
      // expectedToReceiveAmount = bridgePrice.quote(swapBuyAmount)
      // bridgePrice = bridgeBuyAmount / bridgeSellAmount
      // expectedToReceiveAmount = swapBuyAmount * bridgeBuyAmount / bridgeSellAmount
      const expectedAmount = (swapBuyAmountRaw * bridgeBuyAmountRaw) / bridgeSellAmountRaw
      expect(result.current?.expectedToReceiveAmount.quotient.toString()).toBe(expectedAmount.toString())
      expect(result.current?.expectedToReceiveAmount.currency).toEqual(USDC_BASE)

      // Verify feeAmount
      expect(result.current?.feeAmount.quotient.toString()).toBe(feeAmountRaw.toString())
      expect(result.current?.feeAmount.currency).toEqual(USDC_BASE)

      // Verify minToReceiveAmount = expectedToReceiveAmount - feeAmount
      const expectedMinAmount = expectedAmount - feeAmountRaw
      expect(result.current?.minToReceiveAmount.quotient.toString()).toBe(expectedMinAmount.toString())
      expect(result.current?.minToReceiveAmount.currency).toEqual(USDC_BASE)
    })
  })
})
