import { USDC_MAINNET, WETH_MAINNET } from '@cowprotocol/common-const'
import { OrderClass, OrderKind } from '@cowprotocol/cow-sdk'
import { Price } from '@uniswap/sdk-core'

import BigNumber from 'bignumber.js'
import JSBI from 'jsbi'

import { Order } from './actions'
import { getEstimatedExecutionPrice, getRemainderAmountsWithoutSurplus } from './utils'

const getLimitOrderWithFee = (
  sellAmountBeforeFee: number,
  buyAmount: number,
  fee: number,
  orderKind: OrderKind = OrderKind.SELL,
): Order =>
  ({
    id: '',
    inputToken: WETH_MAINNET,
    outputToken: USDC_MAINNET,
    sellAmountBeforeFee: sellAmountBeforeFee.toString(),
    sellAmount: (sellAmountBeforeFee - fee).toString(),
    buyAmount: buyAmount.toString(),
    class: OrderClass.LIMIT,
    kind: orderKind,
  }) as unknown as Order

describe('getEstimatedExecutionPrice()', () => {
  it('Should take the fee into account for the estimated execution price calculation', () => {
    const fee = 0.00021 * 10 ** WETH_MAINNET.decimals
    const sellAmountBeforeFee = 100 * 10 ** WETH_MAINNET.decimals
    const buyAmount = 182000 * 10 ** USDC_MAINNET.decimals

    const fillPrice = new Price(WETH_MAINNET, USDC_MAINNET, '10000000000', '1')

    const orderWithFee = getLimitOrderWithFee(sellAmountBeforeFee, buyAmount, fee)
    const executionPriceWithFee = getEstimatedExecutionPrice(orderWithFee, fillPrice, fee.toString())

    const zeroFee = 0
    const orderWithoutFee = getLimitOrderWithFee(sellAmountBeforeFee, buyAmount, zeroFee)
    const executionPriceWithoutFee = getEstimatedExecutionPrice(orderWithoutFee, fillPrice, zeroFee.toString())

    expect(executionPriceWithFee?.toFixed(12)).toEqual('1820.007835117276')
    expect(executionPriceWithoutFee?.toFixed(12)).toEqual('1820.000000000000')
  })
})

describe('getRemainderAmountsWithoutSurplus()', () => {
  it('Should return the remainder amounts without the surplus', () => {
    const order = getLimitOrderWithFee(
      6.42619072256475129773952e23,
      4.12319564256475887773621e23,
      0.00021,
      OrderKind.SELL,
    )
    const remainderAmounts = getRemainderAmountsWithoutSurplus(order)

    expect(remainderAmounts.buyAmount).toEqual('4.123195642564759e+23')
    expect(remainderAmounts.sellAmount).toEqual('6.426190722564751e+23')
  })

  it('should return the full amount if there is no surplus', () => {
    const order = getLimitOrderWithFee(100, 100, 0)
    const remainderAmounts = getRemainderAmountsWithoutSurplus(order)

    expect(remainderAmounts.buyAmount).toEqual('100')
    expect(remainderAmounts.sellAmount).toEqual('100')
  })

  it('should return the remainder amounts if there is a surplus when passing a SELL ParsedOrder', () => {
    const order = getLimitOrderWithFee(
      12.42619072256475129773952e23,
      23.12319564256475887773621e23,
      0.00021,
      OrderKind.SELL,
    )

    ;(order as any).executionData = {
      executedSellAmount: JSBI.BigInt(4),
      executedBuyAmount: JSBI.BigInt(5),
      surplusAmount: new BigNumber(3),
    }

    const remainderAmounts = getRemainderAmountsWithoutSurplus(order)

    expect(remainderAmounts.buyAmount).toEqual('2312319564256475852308472')
    expect(remainderAmounts.sellAmount).toEqual('1242619072256475131805692')
  })

  it('should return the remainder amounts if there is a surplus when passing a BUY ParsedOrder', () => {
    const order = getLimitOrderWithFee(
      45.42619072256475129773952e23,
      41.12319564256475887773621e23,
      0.000016,
      OrderKind.BUY,
    )

    ;(order as any).executionData = {
      executedSellAmount: JSBI.BigInt(7),
      executedBuyAmount: JSBI.BigInt(4),
      surplusAmount: new BigNumber(2),
    }

    const remainderAmounts = getRemainderAmountsWithoutSurplus(order)

    expect(remainderAmounts.buyAmount).toEqual('4112319564256476036857852')
    expect(remainderAmounts.sellAmount).toEqual('4542619072256475291189243')
  })

  it('should return the remainder amounts if there is surplus when passing a SELL Order', () => {
    const order = getLimitOrderWithFee(
      17.42619072256475129773952e23,
      16.12319564256475887773621e23,
      0.3,
      OrderKind.SELL,
    )

    ;(order as any).apiAdditionalInfo = {
      executedSellAmountBeforeFees: JSBI.BigInt(17),
      executedBuyAmount: JSBI.BigInt(16),
      partiallyFillable: true,
    }

    const remainderAmounts = getRemainderAmountsWithoutSurplus(order)

    expect(remainderAmounts.buyAmount).toEqual('1612319564256475810365424')
    expect(remainderAmounts.sellAmount).toEqual('1742619072256475123417071')
  })

  it('should return the remainder amounts if there is surplus when passing a BUY Order', () => {
    const order = getLimitOrderWithFee(
      11.42619072256475129773952e23,
      10.12319564256475887773621e23,
      0.00045,
      OrderKind.BUY,
    )

    ;(order as any).apiAdditionalInfo = {
      executedSellAmountBeforeFees: JSBI.BigInt(3),
      executedBuyAmount: JSBI.BigInt(2),
      partiallyFillable: true,
    }

    const remainderAmounts = getRemainderAmountsWithoutSurplus(order)

    expect(remainderAmounts.buyAmount).toEqual('1012319564256475927805950')
    expect(remainderAmounts.sellAmount).toEqual('2285238144512950206639866')
  })
})
