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
    sellAmountBeforeFee: '0x' + BigInt(sellAmountBeforeFee).toString(16),
    sellAmount: '0x' + BigInt(sellAmountBeforeFee - fee).toString(16),
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
    const fee = 0.00016 * 10 ** WETH_MAINNET.decimals
    const sellAmountBeforeFee = 99 * 10 ** WETH_MAINNET.decimals
    const buyAmount = 17345 * 10 ** USDC_MAINNET.decimals

    const order = getLimitOrderWithFee(sellAmountBeforeFee, buyAmount, fee, OrderKind.SELL)
    const remainderAmounts = getRemainderAmountsWithoutSurplus(order)

    expect(remainderAmounts.buyAmount).toEqual('17345000000')
    expect(remainderAmounts.sellAmount).toEqual('99000000000000000000')
  })

  it('should return the full amount if there is no surplus', () => {
    const order = getLimitOrderWithFee(100, 100, 0)
    const remainderAmounts = getRemainderAmountsWithoutSurplus(order)

    expect(remainderAmounts.buyAmount).toEqual('100')
    expect(remainderAmounts.sellAmount).toEqual('100')
  })

  it('should return the remainder amounts if there is a surplus when passing a SELL ParsedOrder', () => {
    const fee = 0.1 * 10 ** WETH_MAINNET.decimals
    const sellAmountBeforeFee = 100001 * 10 ** WETH_MAINNET.decimals
    const buyAmount = 12345567 * 10 ** USDC_MAINNET.decimals

    const order = getLimitOrderWithFee(sellAmountBeforeFee, buyAmount, fee, OrderKind.SELL)

    ;(order as any).executionData = {
      executedSellAmount: '0x' + BigInt(99999 * 10 ** WETH_MAINNET.decimals).toString(16),
      executedBuyAmount: '0x' + BigInt(12345566 * 10 ** USDC_MAINNET.decimals).toString(16),
      surplusAmount: new BigNumber('0x' + BigInt(3 * 10 ** WETH_MAINNET.decimals).toString(16)),
    }

    const remainderAmounts = getRemainderAmountsWithoutSurplus(order)

    expect(remainderAmounts.buyAmount).toEqual('2312319564256475852308472')
    expect(remainderAmounts.sellAmount).toEqual('1242619072256475131805692')
  })

  it.skip('should return the remainder amounts if there is a surplus when passing a BUY ParsedOrder', () => {
    const fee = 0.1 * 10 ** WETH_MAINNET.decimals
    const sellAmountBeforeFee = 100001 * 10 ** WETH_MAINNET.decimals
    const buyAmount = 12345567 * 10 ** USDC_MAINNET.decimals

    const order = getLimitOrderWithFee(sellAmountBeforeFee, buyAmount, fee, OrderKind.BUY)

    ;(order as any).executionData = {
      executedSellAmount: 100000 * 10 ** WETH_MAINNET.decimals,
      executedBuyAmount: 12345566 * 10 ** USDC_MAINNET.decimals,
      surplusAmount: 2 * 10 ** WETH_MAINNET.decimals,
    }

    const remainderAmounts = getRemainderAmountsWithoutSurplus(order)

    expect(remainderAmounts.buyAmount).toEqual('4112319564256476036857852')
    expect(remainderAmounts.sellAmount).toEqual('4542619072256475291189243')
  })

  it.skip('should return the remainder amounts if there is surplus when passing a SELL Order', () => {
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

  it.skip('should return the remainder amounts if there is surplus when passing a BUY Order', () => {
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
