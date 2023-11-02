import { USDC_MAINNET, WETH_MAINNET } from '@cowprotocol/common-const'
import { OrderClass } from '@cowprotocol/cow-sdk'
import { Price } from '@uniswap/sdk-core'

import { Order } from './actions'
import { getEstimatedExecutionPrice } from './utils'

const getOrderWithFee = (sellAmountBeforeFee: number, buyAmount: number, fee: number): Order => ({
  id: '',
  inputToken: WETH_MAINNET,
  outputToken: USDC_MAINNET,
  sellAmountBeforeFee: sellAmountBeforeFee.toString(),
  sellAmount: (sellAmountBeforeFee - fee).toString(),
  buyAmount: buyAmount.toString(),
  class: OrderClass.LIMIT,
})

describe('getEstimatedExecutionPrice()', () => {
  it('Should take the fee into account for the estimated execution price calculation', () => {
    const fee = 0.00021 * 10 ** WETH_MAINNET.decimals
    const sellAmountBeforeFee = 100 * 10 ** WETH_MAINNET.decimals
    const buyAmount = 182000 * 10 ** USDC_MAINNET.decimals

    const fillPrice = new Price(WETH_MAINNET, USDC_MAINNET, '10000000000', '1')

    const orderWithFee = getOrderWithFee(sellAmountBeforeFee, buyAmount, fee)
    const executionPriceWithFee = getEstimatedExecutionPrice(orderWithFee, fillPrice, fee.toString())

    const zeroFee = 0
    const orderWithoutFee = getOrderWithFee(sellAmountBeforeFee, buyAmount, zeroFee)
    const executionPriceWithoutFee = getEstimatedExecutionPrice(orderWithoutFee, fillPrice, zeroFee.toString())

    expect(executionPriceWithFee?.toFixed(12)).toEqual('1820.007835117276')
    expect(executionPriceWithoutFee?.toFixed(12)).toEqual('1820.000000000000')
  })
})
