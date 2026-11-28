import { TokenWithLogo, USDC_BASE, USDT_BNB } from '@cowprotocol/common-const'
import { getQuoteAmountsAndCosts, OrderKind, type OrderParameters, SupportedChainId } from '@cowprotocol/cow-sdk'
import { Percent } from '@cowprotocol/currency'
import { BuyTokenDestination, SellTokenSource, SigningScheme } from '@cowprotocol/sdk-order-book'
import { useTryFindToken } from '@cowprotocol/tokens'

import { renderHook } from '@testing-library/react'

import { useTradeQuote } from 'modules/tradeQuote'

import { getBridgeIntermediateTokenAddress } from 'common/utils/getBridgeIntermediateTokenAddress'

import { useDerivedTradeState } from './useDerivedTradeState'
import { useEstimatedBridgeBuyAmount } from './useEstimatedBridgeBuyAmount'
import { useGetReceiveAmountInfo } from './useGetReceiveAmountInfo'
import { useSwapReceiveAmountInfoParams } from './useGetSwapReceiveAmountInfo'

import { getOrderTypeReceiveAmounts } from '../utils/getOrderTypeReceiveAmounts'

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

jest.mock('./useGetSwapReceiveAmountInfo', () => ({
  useSwapReceiveAmountInfoParams: jest.fn(),
}))

const intermediateCurrency = new TokenWithLogo(
  undefined,
  SupportedChainId.BNB,
  '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  18,
  'BNB',
  'BNB Chain Native Token',
)

// Sell 3.49 USDT (Bnb) for BNB, then bridge the BNB to USDC (Base)
const orderParams: OrderParameters = {
  appData: '0x',
  buyAmount: '4229023151143298',
  buyToken: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
  buyTokenBalance: BuyTokenDestination.ERC20,
  feeAmount: '9761540280770856',
  gasAmount: '100000',
  gasPrice: '1000000000',
  sellTokenPrice: '1',
  kind: OrderKind.SELL,
  partiallyFillable: false,
  receiver: '0xfb3c7eb936caa12b5a884d612393969a557d4307',
  sellAmount: '3488333738720117691',
  sellToken: '0x55d398326f99059ff775485246999027b3197955',
  sellTokenBalance: SellTokenSource.ERC20,
  signingScheme: SigningScheme.EIP712,
  validTo: 1764585921,
}

const partnerFeeBps = 25
const protocolFeeBps = 2
const slippagePercent = new Percent(50, 10_000)

// 1 BNB = 823.36 USDC
const bridgeSellAmount = 1_000_000_000_000_000_000n
const bridgeBuyAmount = 823_360_000n
const bridgeFeeInBuyCurrency = 4694n

describe('useGetReceiveAmountInfo - cross-chain swap with a partner fee', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    const swapAmountsAndCosts = getQuoteAmountsAndCosts({
      orderParams,
      slippagePercentBps: Number(slippagePercent.numerator),
      partnerFeeBps,
      protocolFeeBps,
    })

    jest.mocked(useDerivedTradeState).mockReturnValue({
      inputCurrency: USDT_BNB,
      outputCurrency: USDC_BASE,
    } as never)
    jest.mocked(useTryFindToken).mockReturnValue({ token: intermediateCurrency } as never)
    jest.mocked(getBridgeIntermediateTokenAddress).mockReturnValue(intermediateCurrency.address)
    jest.mocked(useSwapReceiveAmountInfoParams).mockReturnValue({
      orderParams,
      quotedOrderParams: orderParams,
      inputCurrency: USDT_BNB,
      outputCurrency: intermediateCurrency,
      slippagePercent,
      partnerFeeBps,
      protocolFeeBps,
    })
    jest.mocked(useTradeQuote).mockReturnValue({
      bridgeQuote: {
        amountsAndCosts: {
          beforeFee: { sellAmount: bridgeSellAmount, buyAmount: bridgeBuyAmount },
          costs: {
            bridgingFee: { amountInSellCurrency: 5700201003969n, amountInBuyCurrency: bridgeFeeInBuyCurrency },
          },
        },
      },
      quote: { quoteResults: { amountsAndCosts: swapAmountsAndCosts } },
    } as never)
  })

  it('deducts the partner fee from the destination amount only once', () => {
    const { result } = renderHook(() => ({
      receiveAmountInfo: useGetReceiveAmountInfo(),
      bridgeEstimatedAmounts: useEstimatedBridgeBuyAmount(),
    }))
    const { receiveAmountInfo, bridgeEstimatedAmounts } = result.current

    // Swap leg, in BNB: 0.004229023151143298 after network costs
    // Partner fee: 0.25% of 0.004241703365304866 (before all fees) = 0.000010604258413262
    // After partner fee: 0.004218418892730036 BNB -> 3.473277 USDC at the bridge price
    expect(bridgeEstimatedAmounts?.expectedToReceiveAmount.toExact()).toBe('3.473277')

    // The partner fee is deducted once, so the swap form matches the bridge section (up to atom rounding)
    expect(receiveAmountInfo?.afterNetworkCosts.buyAmount.toExact()).toBe('3.482008')
    expect(receiveAmountInfo?.costs.partnerFee.amount.toExact()).toBe('0.008731')
    expect(receiveAmountInfo?.afterPartnerFees.buyAmount.toExact()).toBe('3.473277')
    // 3.473277 * (1 - 0.5%)
    expect(receiveAmountInfo?.afterSlippage.buyAmount.toExact()).toBe('3.455911')

    // "Receive" in the swap form: 3.473277 - 0.004694 bridge fee
    const { amountAfterFees } = getOrderTypeReceiveAmounts(receiveAmountInfo!)
    expect(amountAfterFees.toExact()).toBe('3.468583')
  })
})
