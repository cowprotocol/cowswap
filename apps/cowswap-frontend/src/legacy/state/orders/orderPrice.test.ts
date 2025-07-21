import { USDC_MAINNET, WETH_MAINNET } from '@cowprotocol/common-const'
import { OrderClass, OrderKind, SigningScheme } from '@cowprotocol/cow-sdk'
import { Price } from '@uniswap/sdk-core'

import BigNumber from 'bignumber.js'
import JSBI from 'jsbi'

import { Order, OrderStatus } from './actions'
import { getEstimatedExecutionPrice, getRemainderAmountsWithoutSurplus } from './utils'


const getLimitOrderWithFee = (
  sellAmountBeforeFee: string,
  buyAmount: string,
  fee: string,
  orderKind: OrderKind = OrderKind.SELL,
): Order => ({
  owner: '',
  status: OrderStatus.CREATING,
  summary: '',
  creationTime: '',
  sellToken: '',
  buyToken: '',
  validTo: 0,
  feeAmount: '',
  kind: orderKind,
  partiallyFillable: false,
  id: '',
  inputToken: WETH_MAINNET,
  outputToken: USDC_MAINNET,
  sellAmountBeforeFee,
  sellAmount: new BigNumber(sellAmountBeforeFee).minus(new BigNumber(fee)).toString(),
  buyAmount: new BigNumber(buyAmount).toString(),
  class: OrderClass.LIMIT,
  appData: '',
  signingScheme: SigningScheme.EIP712,
  signature: '',
})

describe('getEstimatedExecutionPrice()', () => {
  it('Should take the fee into account for the estimated execution price calculation', () => {
    const fee = new BigNumber(0.00021).times(10 ** WETH_MAINNET.decimals).toString()
    const sellAmountBeforeFee = new BigNumber(100).times(10 ** WETH_MAINNET.decimals).toString()
    const buyAmount = new BigNumber(182000).times(10 ** USDC_MAINNET.decimals).toString()

    const fillPrice = new Price(WETH_MAINNET, USDC_MAINNET, '10000000000', '1')

    const orderWithFee = getLimitOrderWithFee(sellAmountBeforeFee, buyAmount, fee)
    const executionPriceWithFee = getEstimatedExecutionPrice(orderWithFee, fillPrice, fee.toString())

    const zeroFee = new BigNumber(0).toString()
    const orderWithoutFee = getLimitOrderWithFee(sellAmountBeforeFee, buyAmount, zeroFee)
    const executionPriceWithoutFee = getEstimatedExecutionPrice(orderWithoutFee, fillPrice, zeroFee.toString())

    expect(executionPriceWithFee?.toFixed(12)).toEqual('1820.007835117276')
    expect(executionPriceWithoutFee?.toFixed(12)).toEqual('1820.000000000000')
  })
})

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
describe('getRemainderAmountsWithoutSurplus()', () => {
  it('Should return the remainder amounts without the surplus', () => {
    const fee = new BigNumber(0.00016).times(10 ** WETH_MAINNET.decimals).toString()
    const sellAmountBeforeFee = new BigNumber(99).times(10 ** WETH_MAINNET.decimals).toString()
    const buyAmount = new BigNumber(17345).times(10 ** USDC_MAINNET.decimals).toString()

    const order = getLimitOrderWithFee(sellAmountBeforeFee, buyAmount, fee, OrderKind.SELL)
    const remainderAmounts = getRemainderAmountsWithoutSurplus(order)

    expect(remainderAmounts.buyAmount).toEqual('17345000000')
    expect(remainderAmounts.sellAmount).toEqual('99000000000000000000')
  })

  it('should return the full amount if there is no surplus', () => {
    const fee = new BigNumber(0).toString()
    const sellAmountBeforeFee = new BigNumber(100).times(10 ** WETH_MAINNET.decimals).toString()
    const buyAmount = new BigNumber(100).times(10 ** USDC_MAINNET.decimals).toString()

    const order = getLimitOrderWithFee(sellAmountBeforeFee, buyAmount, fee)
    const remainderAmounts = getRemainderAmountsWithoutSurplus(order)

    expect(remainderAmounts.buyAmount).toEqual('100000000')
    expect(remainderAmounts.sellAmount).toEqual('100000000000000000000')
  })

  it('should return the remainder amounts if there is a surplus when passing a SELL ParsedOrder', () => {
    const fee = new BigNumber(0.1).times(10 ** WETH_MAINNET.decimals).toString()
    const sellAmountBeforeFee = new BigNumber(101).times(10 ** WETH_MAINNET.decimals).toString()
    const buyAmount = new BigNumber(12345567).times(10 ** USDC_MAINNET.decimals).toString()

    const order = getLimitOrderWithFee(sellAmountBeforeFee, buyAmount, fee, OrderKind.SELL)

    // TODO: Replace any with proper type definitions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(order as any).executionData = {
      executedSellAmount: new BigNumber(99 * 10 ** WETH_MAINNET.decimals),
      executedBuyAmount: new BigNumber(12345566 * 10 ** USDC_MAINNET.decimals),
      surplusAmount: new BigNumber(3 * 10 ** WETH_MAINNET.decimals),
    }

    const remainderAmounts = getRemainderAmountsWithoutSurplus(order)

    expect(remainderAmounts.buyAmount).toEqual('-2999999999999000000')
    expect(remainderAmounts.sellAmount).toEqual('1900000000000000000')
  })

  it('should return the remainder amounts if there is a surplus when passing a BUY ParsedOrder', () => {
    const fee = new BigNumber(0.1).times(10 ** WETH_MAINNET.decimals).toString()
    const sellAmountBeforeFee = new BigNumber(101).times(10 ** WETH_MAINNET.decimals).toString()
    const buyAmount = new BigNumber(12345567).times(10 ** USDC_MAINNET.decimals).toString()

    const order = getLimitOrderWithFee(sellAmountBeforeFee, buyAmount, fee, OrderKind.BUY)

    // TODO: Replace any with proper type definitions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(order as any).executionData = {
      executedSellAmount: new BigNumber(101 * 10 ** WETH_MAINNET.decimals),
      executedBuyAmount: new BigNumber(12345566 * 10 ** USDC_MAINNET.decimals),
      surplusAmount: new BigNumber(2 * 10 ** WETH_MAINNET.decimals),
    }

    const remainderAmounts = getRemainderAmountsWithoutSurplus(order)

    expect(remainderAmounts.buyAmount).toEqual('1000000')
    expect(remainderAmounts.sellAmount).toEqual('1900000000000000000')
  })

  it('should return the remainder amounts if there is surplus when passing a SELL Order', () => {
    const fee = new BigNumber(0.02).times(10 ** WETH_MAINNET.decimals).toString()
    const sellAmountBeforeFee = new BigNumber(304).times(10 ** WETH_MAINNET.decimals).toString()
    const buyAmount = new BigNumber(6763849).times(10 ** USDC_MAINNET.decimals).toString()

    const order = getLimitOrderWithFee(sellAmountBeforeFee, buyAmount, fee, OrderKind.SELL)

    // TODO: Replace any with proper type definitions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(order as any).apiAdditionalInfo = {
      executedSellAmountBeforeFees: JSBI.BigInt(17),
      executedBuyAmount: JSBI.BigInt(16),
      partiallyFillable: true,
    }

    const remainderAmounts = getRemainderAmountsWithoutSurplus(order)

    expect(remainderAmounts.buyAmount).toEqual('6763848999984')
    expect(remainderAmounts.sellAmount).toEqual('303999999999999999983')
  })

  it('should return the remainder amounts if there is surplus when passing a BUY Order', () => {
    const fee = new BigNumber(1.1).times(10 ** WETH_MAINNET.decimals).toString()
    const sellAmountBeforeFee = new BigNumber(10.3).times(10 ** WETH_MAINNET.decimals).toString()
    const buyAmount = new BigNumber(11224).times(10 ** USDC_MAINNET.decimals).toString()

    const order = getLimitOrderWithFee(sellAmountBeforeFee, buyAmount, fee, OrderKind.BUY)

    // TODO: Replace any with proper type definitions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(order as any).apiAdditionalInfo = {
      executedSellAmountBeforeFees: JSBI.BigInt(3),
      executedBuyAmount: JSBI.BigInt(2),
      partiallyFillable: true,
    }

    const remainderAmounts = getRemainderAmountsWithoutSurplus(order)

    expect(remainderAmounts.buyAmount).toEqual('11223999998')
    expect(remainderAmounts.sellAmount).toEqual('19499999999999999994')
  })
})
