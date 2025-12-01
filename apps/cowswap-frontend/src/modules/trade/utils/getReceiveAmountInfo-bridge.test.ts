import { TokenWithLogo, USDC_BASE, USDT_BNB } from '@cowprotocol/common-const'
import { OrderKind, type OrderParameters, SupportedChainId } from '@cowprotocol/cow-sdk'
import { BuyTokenDestination, SellTokenSource, SigningScheme } from '@cowprotocol/sdk-order-book'
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'

import { getOrderTypeReceiveAmounts, getReceiveAmountInfo } from './getReceiveAmountInfo'

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
const volumeFeeBps = undefined
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

describe('getReceiveAmountInfo - bridge cases', () => {
  it('Sell 3.49 USDT (Bnb) to USDC (Base) with BNB (Bnb) as intermediate token', () => {
    const receiveAmountInfo = getReceiveAmountInfo(
      orderParams,
      inputCurrency,
      outputCurrency,
      slippagePercent,
      volumeFeeBps,
      intermediateCurrency,
      bridgeFeeAmounts,
      bridgeBuyAmount,
      protocolFeeBps,
    )

    const {
      isSell,
      costs: {
        partnerFee: { amount: partnerFeeAmount },
        protocolFee,
        bridgeFee,
      },
      beforeAllFees,
    } = receiveAmountInfo
    const { amountAfterFees, networkFeeAmount } = getOrderTypeReceiveAmounts(receiveAmountInfo)

    const protocolFeeAmount = protocolFee?.amount
    const beforeAllFeesAmount = isSell ? beforeAllFees.buyAmount : beforeAllFees.sellAmount
    const bridgeFeeAmount = bridgeFee?.amountInIntermediateCurrency

    // 1 BNB = 824 USDC
    // This is correct
    expect(stringifyTokenAmount(beforeAllFeesAmount)).toBe('3.363300173433626112 BNB (56)')
    // This is wrong, the protocolFeeAmount should be ~0.000000846 BNB or ~0.00067 USDC
    expect(stringifyTokenAmount(protocolFeeAmount)).toBe('0.000670782956591318 BNB (56)')
    expect(stringifyTokenAmount(partnerFeeAmount)).toBe('0 BNB (56)')
    // This is wrong, the networkFeeAmount should be ~0.000012 BNB or ~0.00938 USDC
    expect(stringifyTokenAmount(networkFeeAmount)).toBe('0.009385390477034976 BNB (56)')
    // This is correct
    expect(stringifyTokenAmount(bridgeFeeAmount)).toBe('0.000005700201003969 BNB (56)')
    // This is correct
    expect(stringifyTokenAmount(amountAfterFees)).toBe('3.353238299798996031 BNB (56)')
  })
})
