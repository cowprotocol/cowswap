import { COW, TokenWithLogo, WETH_MAINNET } from '@cowprotocol/common-const'
import {
  OrderParameters,
  OrderKind,
  SupportedChainId,
  SigningScheme,
  BuyTokenDestination,
  SellTokenSource,
} from '@cowprotocol/cow-sdk'

import { getReceiveAmountInfo, getReceiveAmountInfoContext } from './useReceiveAmountInfo'

const otherFields = {
  buyToken: '0xdef1ca1fb7fbcdc777520aa7f396b4e015f497ab',
  sellToken: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  buyTokenBalance: BuyTokenDestination.ERC20,
  sellTokenBalance: SellTokenSource.ERC20,
  signingScheme: SigningScheme.EIP712,
  partiallyFillable: false,
  receiver: '0x0000000000000000000000000000000000000000',
  validTo: 1716904696,
  appData: '{}',
  appDataHash: '0x0',
}

const inputToken = WETH_MAINNET
const outputToken = COW[SupportedChainId.MAINNET]

/**
 * Since we have partner fees, now it's not clear what does it mean `feeAmount`?
 * To avoid confusion, we should consider this `feeAmount` as `networkCosts`
 *
 * Fee is always taken from sell token (for sell/buy orders):
 * 3855544038281082 + 156144455961718918 = 160000000000000000
 *
 * Again, to avoid confusion, we should take this `sellAmount` as `sellAmountBeforeNetworkCosts`
 * Hence, `buyAmount` is `buyAmountAfterNetworkCosts` because this amount is what you will get for the sell amount
 *
 * In this order we are selling 0.16 WETH for 1863 COW - network costs
 */
const SELL_ORDER: OrderParameters = {
  kind: OrderKind.SELL,
  sellAmount: '156144455961718918',
  feeAmount: '3855544038281082',
  buyAmount: '1863201398243026632967',
  ...otherFields,
}

/**
 * In this order we are buying 2000 COW for 1.6897 WETH + network costs
 */
const BUY_ORDER: OrderParameters = {
  kind: OrderKind.BUY,
  sellAmount: '168970833896526983',
  feeAmount: '2947344072902629',
  buyAmount: '2000000000000000000000',
  ...otherFields,
}

describe('Calculation of before/after fees amounts', () => {
  describe('getReceiveAmountInfoContext() returns amounts after and before network costs', () => {
    describe.each(['sell', 'buy'])('%s order', (type: string) => {
      const order = type === 'sell' ? SELL_ORDER : BUY_ORDER

      it('Sell amount after network costs should be sellAmount + feeAmount', () => {
        const result = getReceiveAmountInfoContext(order, inputToken, outputToken)

        expect(result.afterNetworkCosts.sellAmount.quotient.toString()).toBe(
          String(BigInt(order.sellAmount) + BigInt(order.feeAmount))
        )
      })

      it('Buy amount before network costs should be SellAmountAfterNetworkCosts * Price', () => {
        const result = getReceiveAmountInfoContext(order, inputToken, outputToken)

        expect(+result.beforeNetworkCosts.buyAmount.quotient.toString()).toBe(
          (+order.sellAmount + +order.feeAmount) * // SellAmountAfterNetworkCosts
            (+order.buyAmount / +order.sellAmount) // Price
        )
      })
    })
  })

  describe('getReceiveAmountInfo() calculates amounts after fees', () => {
    const partnerFee = {
      recipient: '0x0000000000000000000000000000000000000000',
      bps: 100,
    }

    describe('Sell order', () => {
      const context = {
        partnerFee,
        ...getReceiveAmountInfoContext(SELL_ORDER, inputToken, outputToken),
      }

      it('Partner fee should be substracted from buy amount after network costs', () => {
        const order = SELL_ORDER
        const result = getReceiveAmountInfo(context)

        const buyAmountBeforeNetworkCosts =
          (+order.sellAmount + +order.feeAmount) * // SellAmountAfterNetworkCosts
          (+order.buyAmount / +order.sellAmount) // Price

        const partnerFeeAmount = (buyAmountBeforeNetworkCosts * partnerFee.bps) / 100 / 100

        expect(+result.partnerFeeAmount!.quotient.toString()).toBe(partnerFeeAmount)
      })
    })

    describe('Buy order', () => {
      const context = {
        partnerFee,
        ...getReceiveAmountInfoContext(BUY_ORDER, inputToken, outputToken),
      }

      it('Partner fee should be added on top of sell amount after network costs', () => {
        const order = BUY_ORDER
        const result = getReceiveAmountInfo(context)

        const partnerFeeAmount = (+order.sellAmount * partnerFee.bps) / 100 / 100

        expect(result.partnerFeeAmount!.toExact()).toBe(
          numberToTokenUnits((partnerFeeAmount / 10 ** inputToken.decimals).toString(), outputToken)
        )
      })
    })
  })
})

function numberToTokenUnits(value: string, token: TokenWithLogo): string {
  const { decimals } = token
  const [integer, numeral] = value.split('.')

  return `${integer.slice(0, decimals)}${numeral ? '.' + numeral.slice(0, decimals) : ''}`
}
