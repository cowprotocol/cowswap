import { TokenWithLogo, USDC_BASE, USDT_BNB } from '@cowprotocol/common-const'
import { OrderKind, type OrderParameters, SupportedChainId } from '@cowprotocol/cow-sdk'
import { BuyTokenDestination, SellTokenSource, SigningScheme } from '@cowprotocol/sdk-order-book'
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'

import { getCrossChainReceiveAmountInfo } from './getCrossChainReceiveAmountInfo'
import { getOrderTypeReceiveAmounts } from './getOrderTypeReceiveAmounts'

const orderParams: OrderParameters = {
  appData:
    '{"appCode":"CoW Swap","environment":"local","metadata":{"bridging":{"destinationChainId":"8453","destinationTokenAddress":"0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913","providerId":"cow-sdk://bridging/providers/near-intents"},"orderClass":{"orderClass":"market"},"quote":{"slippageBips":50}},"version":"1.10.0"}',
  buyAmount: '4229023151143298',
  buyToken: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
  buyTokenBalance: BuyTokenDestination.ERC20,
  feeAmount: '9761540280770856',
  kind: OrderKind.SELL,
  partiallyFillable: false,
  receiver: '0xfb3c7eb936caa12b5a884d612393969a557d4307',
  sellAmount: '3488333738720117691',
  sellToken: '0x55d398326f99059ff775485246999027b3197955',
  sellTokenBalance: SellTokenSource.ERC20,
  signingScheme: SigningScheme.EIP712,
  validTo: 1764585921,
}

const inputCurrency = USDT_BNB
const outputCurrency = USDC_BASE
const intermediateCurrency = new TokenWithLogo(
  undefined,
  SupportedChainId.BNB,
  '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  18,
  'BNB',
  'BNB Chain Native Token',
)

const slippagePercent = new Percent(373, 10_000) // 3.7300
const protocolFeeBps = 2
const volumeFeeBps = 3
const bridgeFeeAmounts = {
  amountInBuyCurrency: 5700201003969n,
  amountInSellCurrency: 4694n,
  feeBps: 14,
}
const expectedToReceiveAmount = CurrencyAmount.fromRawAmount(outputCurrency, 3353244n.toString())

function stringifyTokenAmount(amount: CurrencyAmount<Currency> | undefined): string {
  if (!amount) return ''

  return `${amount.toExact()} ${amount.currency.symbol} (${amount.currency.chainId})`
}

function stringifyTokenAmounts(amounts: {
  sellAmount: CurrencyAmount<Currency>
  buyAmount: CurrencyAmount<Currency>
}): string {
  return `Sell: ${stringifyTokenAmount(amounts.sellAmount)}, buy: ${stringifyTokenAmount(amounts.buyAmount)}`
}

describe('getCrossChainReceiveAmountInfo - adjusts SDK getQuoteAmountsAndCosts() for cross-chain swaps', () => {
  describe('Sell 3.49 USDT (Bnb) to USDC (Base) with BNB (Bnb) as intermediate token. 1 BNB ~ 824 USDC', () => {
    const receiveAmountInfo = getCrossChainReceiveAmountInfo({
      orderParams,
      inputCurrency,
      outputCurrency,
      slippagePercent,
      partnerFeeBps: volumeFeeBps,
      intermediateCurrency,
      bridgeFeeAmounts,
      protocolFeeBps,
      expectedToReceiveAmount,
    })

    const {
      costs: {
        partnerFee: { amount: partnerFeeAmount },
        protocolFee,
        bridgeFee,
      },
      beforeAllFees,
      beforeNetworkCosts,
      afterNetworkCosts,
      afterPartnerFees,
      afterSlippage,
    } = receiveAmountInfo
    const { amountAfterFees, networkFeeAmount } = getOrderTypeReceiveAmounts(receiveAmountInfo)

    it('Before all fees', () => {
      // sellAmount: Genuine spot price = orderParams.sellAmount + feeAmount
      //           = 3488333738720117691 + 9761540280770856 = 3498095279000888547
      expect(stringifyTokenAmount(beforeAllFees.sellAmount)).toBe('3.498095279000888547 USDT (56)')

      // buyAmount: Genuine spot price in destination currency (USDC) before any fees are deducted
      // Calculation: afterProtocolFees.buyAmount + protocolFee
      //            = 3.353914 USDC + 0.00067 USDC
      //            = 3.354584 USDC
      expect(stringifyTokenAmount(beforeAllFees.buyAmount)).toBe('3.354584 USDC (8453)')
    })
    it('Before network costs', () => {
      // sellAmount: Same as beforeAllFees (genuine spot price)
      // buyAmount: beforeAllFees.buyAmount - networkFee
      //          = 3.363299 USDC - 0.009385 USDC
      //          = 3.353914 USDC
      expect(stringifyTokenAmounts(beforeNetworkCosts)).toBe(
        'Sell: 3.498095279000888547 USDT (56), buy: 3.353914 USDC (8453)',
      )
    })
    it('After networks costs', () => {
      // sellAmount: Raw API sellAmount with network costs baked in
      //           = 3.488333738720117691 USDT (orderParams.sellAmount)
      // buyAmount: Same as beforeNetworkCosts.buyAmount (3.353914 USDC)
      expect(stringifyTokenAmounts(afterNetworkCosts)).toBe(
        'Sell: 3.488333738720117691 USDT (56), buy: 3.353914 USDC (8453)',
      )
    })
    it('After partner fees', () => {
      // sellAmount: Same as afterNetworkCosts (raw API sellAmount)
      // buyAmount: afterNetworkCosts.buyAmount - partnerFee
      //          = 3.353914 USDC - 0.001006 USDC
      //          = 3.352908 USDC
      expect(stringifyTokenAmounts(afterPartnerFees)).toBe(
        'Sell: 3.488333738720117691 USDT (56), buy: 3.352908 USDC (8453)',
      )
    })
    it('After slippage', () => {
      // sellAmount: Same as afterPartnerFees (slippage doesn't affect sell amount in sell orders)
      // buyAmount: afterPartnerFees.buyAmount adjusted for slippage tolerance
      //          = 3.352908 USDC * (1 - 3.73%)
      //          = 3.227845 USDC (minimum amount accounting for slippage)
      expect(stringifyTokenAmounts(afterSlippage)).toBe(
        'Sell: 3.488333738720117691 USDT (56), buy: 3.227845 USDC (8453)',
      )
    })
    it('Protocol fee', () => {
      // Protocol fee: 0.02% of bridgeBuyAmount (3.353244 USDC)
      // Calculation: 3.353244 * 0.0002 = 0.00067064 88 USDC
      // Rounded: 0.00067 USDC
      // Note: Fee is in destination currency (USDC) for cross-chain swaps
      expect(stringifyTokenAmount(protocolFee?.amount)).toBe('0.00067 USDC (8453)')
    })
    it('Partner fee', () => {
      // Partner fee: 0.03% of bridgeBuyAmount (3.353244 USDC)
      // Calculation: 3.353244 * 0.0003 = 0.00100597 32 USDC
      // Rounded: 0.001006 USDC
      expect(stringifyTokenAmount(partnerFeeAmount)).toBe('0.001006 USDC (8453)')
    })
    it('Network fee', () => {
      // Network fee: Taken from orderParams.feeAmount (9761540280770856 raw)
      // In intermediate currency (BNB): 9761540280770856 / 10^18 = 0.009761540280770856 BNB
      // Converted to destination currency (USDC) using pure bigint cross-multiplication
      // Note: The SDK now uses bigint math instead of floating-point for precision
      expect(stringifyTokenAmount(networkFeeAmount)).toBe('0.009383 USDC (8453)')
    })
    it('Bridge fee', () => {
      // Bridge fee in destination currency: From bridgeFeeAmounts.amountInSellCurrency
      //   4694 (raw, 6 decimals) = 0.004694 USDC
      expect(stringifyTokenAmount(bridgeFee?.amountInDestinationCurrency)).toBe('0.004694 USDC (8453)')

      // Bridge fee in intermediate currency: From bridgeFeeAmounts.amountInBuyCurrency
      //   5700201003969 (raw, 18 decimals) = 0.000005700201003969 BNB
      // These two amounts establish the exchange rate: 0.004694 USDC = 0.000005700201003969 BNB
      //   → 1 BNB ≈ 823.4 USDC
      expect(stringifyTokenAmount(bridgeFee?.amountInIntermediateCurrency)).toBe('0.000005700201003969 BNB (56)')
    })
    it('After fees', () => {
      // Final amount user receives: afterPartnerFees.buyAmount - bridgeFee.amountInDestinationCurrency
      // Calculation: 3.352908 USDC - 0.004694 USDC = 3.348214 USDC
      // This is the actual USDC amount that will arrive on the destination chain (Base)
      expect(stringifyTokenAmount(amountAfterFees)).toBe('3.348214 USDC (8453)')
    })
  })
})
