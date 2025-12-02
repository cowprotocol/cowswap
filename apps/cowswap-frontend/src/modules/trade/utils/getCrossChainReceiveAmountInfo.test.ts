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
const bridgeBuyAmount = 3353244n

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
      bridgeBuyAmount,
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
      expect(stringifyTokenAmounts(beforeAllFees)).toBe(
        'Sell: 3.488333738720117691 USDT (56), buy: 3.363299 USDC (8453)',
      )
    })

    it('Before network costs', () => {
      expect(stringifyTokenAmounts(beforeNetworkCosts)).toBe(
        'Sell: 3.488333738720117691 USDT (56), buy: 3.353914 USDC (8453)',
      )
    })
    it('After networks costs', () => {
      expect(stringifyTokenAmounts(afterNetworkCosts)).toBe(
        'Sell: 3.498095279000888547 USDT (56), buy: 3.353244 USDC (8453)',
      )
    })
    it('After partner fees', () => {
      expect(stringifyTokenAmounts(afterPartnerFees)).toBe(
        'Sell: 3.498095279000888547 USDT (56), buy: 3.352238 USDC (8453)',
      )
    })
    it('After slippage', () => {
      expect(stringifyTokenAmounts(afterSlippage)).toBe('Sell: 3.498095279000888547 USDT (56), buy: 3.2272 USDC (8453)')
    })
    it('Before all fees', () => {
      expect(stringifyTokenAmount(beforeAllFees.sellAmount)).toBe('3.488333738720117691 USDT (56)')
      expect(stringifyTokenAmount(beforeAllFees.buyAmount)).toBe('3.363299 USDC (8453)')
    })
    it('Protocol fee', () => {
      // Protocol fee: 0.02% of 3.353244 USDC = 0.000670648 USDC, converted to BNB using bridge fee ratio
      expect(stringifyTokenAmount(protocolFee?.amount)).toBe('0.00067 USDC (8453)')
    })
    it('Partner fee', () => {
      expect(stringifyTokenAmount(partnerFeeAmount)).toBe('0.001006 USDC (8453)')
    })
    it('Network fee', () => {
      // Network fee: ~0.00938 USDC converted to BNB using bridge fee ratio
      expect(stringifyTokenAmount(networkFeeAmount)).toBe('0.009385 USDC (8453)')
    })
    it('Bridge fee', () => {
      expect(stringifyTokenAmount(bridgeFee?.amountInDestinationCurrency)).toBe('0.004694 USDC (8453)')
      expect(stringifyTokenAmount(bridgeFee?.amountInIntermediateCurrency)).toBe('0.000005700201003969 BNB (56)')
    })
    it('After fees', () => {
      expect(stringifyTokenAmount(amountAfterFees)).toBe('3.347544 USDC (8453)')
    })
  })
})
