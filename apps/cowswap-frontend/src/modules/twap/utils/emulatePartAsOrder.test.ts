import { OrderKind } from '@cowprotocol/cow-sdk'
import { BuyTokenDestination, SellTokenSource } from '@cowprotocol/sdk-order-book'

import { emulatePartAsOrder } from './emulatePartAsOrder'

import { DEFAULT_TWAP_EXECUTION_INFO } from '../const'
import { TwapPartOrderItem } from '../state/twapPartOrdersAtom'
import { TwapOrderItem, TwapOrderStatus } from '../types'

const parentOrder: TwapOrderItem = {
  id: 'parent-order',
  chainId: 1,
  submissionDate: new Date('2026-03-09T10:00:00.000Z').toISOString(),
  executedDate: new Date('2026-03-09T10:01:00.000Z').toISOString(),
  safeAddress: '0x0000000000000000000000000000000000000001',
  status: TwapOrderStatus.Pending,
  isPrototype: true,
  executionInfo: {
    confirmedPartsCount: 1,
    info: DEFAULT_TWAP_EXECUTION_INFO,
  },
  order: {
    sellToken: '0x0000000000000000000000000000000000000002',
    buyToken: '0x0000000000000000000000000000000000000003',
    receiver: '0x0000000000000000000000000000000000000001',
    partSellAmount: '100',
    minPartLimit: '50',
    t0: 0,
    n: 7,
    t: 300,
    span: 0,
    appData: '0x00',
  },
}

const partOrder: TwapPartOrderItem = {
  uid: 'part-order-0',
  index: 0,
  chainId: 1,
  safeAddress: '0x0000000000000000000000000000000000000001',
  twapOrderId: 'parent-order',
  isCreatedInOrderBook: false,
  isCancelling: false,
  isPrototype: true,
  order: {
    sellToken: '0x0000000000000000000000000000000000000002',
    buyToken: '0x0000000000000000000000000000000000000003',
    receiver: '0x0000000000000000000000000000000000000001',
    sellAmount: '100',
    buyAmount: '50',
    validTo: Math.floor(Date.now() / 1000) + 300,
    appData: '0x00',
    feeAmount: '0',
    kind: OrderKind.SELL,
    partiallyFillable: false,
    sellTokenBalance: SellTokenSource.ERC20,
    buyTokenBalance: BuyTokenDestination.ERC20,
  },
}

describe('emulatePartAsOrder()', () => {
  it('marks confirmed virtual parts as executed', () => {
    const order = emulatePartAsOrder(partOrder, parentOrder)

    expect(order.executedSellAmount).toBe('100')
    expect(order.executedSellAmountBeforeFees).toBe('100')
    expect(order.executedBuyAmount).toBe('50')
  })
})
