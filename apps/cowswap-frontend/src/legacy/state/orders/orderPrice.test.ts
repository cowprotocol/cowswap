import { USDC_MAINNET, WETH_MAINNET } from '@cowprotocol/common-const'
import { OrderClass, OrderKind } from '@cowprotocol/cow-sdk'
import { Price } from '@uniswap/sdk-core'

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

    expect(remainderAmounts.buyAmount).toEqual('412319564256475911028736')
    expect(remainderAmounts.sellAmount).toEqual('642619072256475115028480')
  })
})
