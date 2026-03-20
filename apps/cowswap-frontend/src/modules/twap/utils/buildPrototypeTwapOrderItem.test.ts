import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import { buildPrototypeTwapOrderItem, getPrototypeTwapExecution } from './buildPrototypeTwapOrderItem'

import { TwapOrderStatus, TWAPOrder } from '../types'

const CHAIN_ID = SupportedChainId.MAINNET
const OWNER = '0x0000000000000000000000000000000000000001'
const SELL_TOKEN = new Token(CHAIN_ID, '0x0000000000000000000000000000000000000010', 18, 'WETH', 'Wrapped Ether')
const BUY_TOKEN = new Token(CHAIN_ID, '0x0000000000000000000000000000000000000020', 6, 'USDC', 'USD Coin')

function buildOrder(numOfParts = 4): TWAPOrder {
  return {
    sellAmount: CurrencyAmount.fromRawAmount(SELL_TOKEN, '8000000000000000000'),
    buyAmount: CurrencyAmount.fromRawAmount(BUY_TOKEN, '16000000'),
    receiver: OWNER,
    numOfParts,
    startTime: 0,
    timeInterval: 900,
    span: 0,
    appData: `0x${'11'.repeat(32)}`,
  }
}

describe('buildPrototypeTwapOrderItem', () => {
  it('marks prototype orders and preserves the requested status', () => {
    const order = buildPrototypeTwapOrderItem({
      chainId: CHAIN_ID,
      ownerAddress: OWNER,
      twapOrder: buildOrder(),
      status: TwapOrderStatus.Pending,
      submissionDate: '2026-03-09T10:00:00.000Z',
      executedDate: '2026-03-09T10:01:00.000Z',
      saltSeed: 1,
      confirmedPartsCount: 1,
    })

    expect(order.isPrototype).toBe(true)
    expect(order.status).toBe(TwapOrderStatus.Pending)
    expect(order.executionInfo.confirmedPartsCount).toBe(1)
    expect(order.prototypeSimulation).toBeUndefined()
  })

  it('derives executed amounts from confirmed parts count', () => {
    const execution = getPrototypeTwapExecution(
      {
        sellToken: SELL_TOKEN.address,
        buyToken: BUY_TOKEN.address,
        receiver: OWNER,
        partSellAmount: '2000000000000000000',
        minPartLimit: '4000000',
        t0: 0,
        n: 4,
        t: 900,
        span: 0,
        appData: `0x${'11'.repeat(32)}`,
      },
      TwapOrderStatus.Pending,
      2,
    )

    expect(execution.confirmedPartsCount).toBe(2)
    expect(execution.info.executedSellAmount).toBe('4000000000000000000')
    expect(execution.info.executedBuyAmount).toBe('8000000')
  })

  it('defaults fulfilled orders to all parts confirmed', () => {
    const order = buildPrototypeTwapOrderItem({
      chainId: CHAIN_ID,
      ownerAddress: OWNER,
      twapOrder: buildOrder(3),
      status: TwapOrderStatus.Fulfilled,
      submissionDate: '2026-03-09T10:00:00.000Z',
      executedDate: '2026-03-09T10:01:00.000Z',
      saltSeed: 2,
    })

    expect(order.executionInfo.confirmedPartsCount).toBe(3)
    expect(order.executionInfo.info.executedSellAmount).toBe(
      (BigInt(order.order.partSellAmount) * BigInt(order.order.n)).toString(),
    )
    expect(order.executionInfo.info.executedBuyAmount).toBe(
      (BigInt(order.order.minPartLimit) * BigInt(order.order.n)).toString(),
    )
  })
})
