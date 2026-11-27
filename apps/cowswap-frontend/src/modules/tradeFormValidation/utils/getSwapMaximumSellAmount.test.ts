import { getQuoteAmountsAndCosts, OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'
import type { OrderParameters } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount, Token } from '@cowprotocol/currency'

import type { ReceiveAmountInfo } from 'modules/trade'

import { getSwapMaximumSellAmount } from './getSwapMaximumSellAmount.utils'

const USDC = new Token(SupportedChainId.MAINNET, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC', 'USD Coin')
const WETH = new Token(
  SupportedChainId.MAINNET,
  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  18,
  'WETH',
  'Wrapped Ether',
)

const SLIPPAGE_BPS = 50

type SellBuyAmounts = { sellAmount: CurrencyAmount<Currency>; buyAmount: CurrencyAmount<Currency> }

function getQuoteOrderParams(kind: OrderKind, sellAmount: string, feeAmount: string): OrderParameters {
  return {
    sellToken: USDC.address,
    buyToken: WETH.address,
    receiver: null,
    sellAmount,
    buyAmount: '40000000000000000',
    validTo: 1_800_000_000,
    appData: '0x0000000000000000000000000000000000000000000000000000000000000000',
    feeAmount,
    gasAmount: '150000',
    gasPrice: '10000000000',
    sellTokenPrice: '250000000',
    kind,
    partiallyFillable: false,
  }
}

function getSwapReceiveAmountInfo(orderParams: OrderParameters): ReceiveAmountInfo {
  const { afterSlippage, amountsToSign } = getQuoteAmountsAndCosts({
    orderParams,
    slippagePercentBps: SLIPPAGE_BPS,
    partnerFeeBps: undefined,
    protocolFeeBps: undefined,
  })
  const receiveAmountInfo: Pick<ReceiveAmountInfo, 'afterSlippage' | 'amountsToSign'> = {
    afterSlippage: toCurrencyAmounts(afterSlippage),
    amountsToSign: toCurrencyAmounts(amountsToSign),
  }

  return receiveAmountInfo as ReceiveAmountInfo
}

function toCurrencyAmounts({ sellAmount, buyAmount }: { sellAmount: bigint; buyAmount: bigint }): SellBuyAmounts {
  return {
    sellAmount: CurrencyAmount.fromRawAmount(USDC, sellAmount.toString()),
    buyAmount: CurrencyAmount.fromRawAmount(WETH, buyAmount.toString()),
  }
}

describe('getSwapMaximumSellAmount', () => {
  it('includes the network costs of a sell order, which the signed order pulls from the wallet', () => {
    // Selling 101 USDC: /quote returns the sell amount after network costs (99.5 USDC) plus 1.5 USDC of network costs
    const receiveAmountInfo = getSwapReceiveAmountInfo(getQuoteOrderParams(OrderKind.SELL, '99500000', '1500000'))

    expect(getSwapMaximumSellAmount(receiveAmountInfo)?.quotient.toString()).toBe('101000000')
  })

  it('includes network costs and slippage for a buy order', () => {
    // (100 USDC + 1.5 USDC network costs) * (1 + 0.5% slippage) = 102.0075 USDC
    const receiveAmountInfo = getSwapReceiveAmountInfo(getQuoteOrderParams(OrderKind.BUY, '100000000', '1500000'))

    expect(getSwapMaximumSellAmount(receiveAmountInfo)?.quotient.toString()).toBe('102007500')
  })

  it('returns null when there is no quote', () => {
    expect(getSwapMaximumSellAmount(null)).toBeNull()
  })
})
