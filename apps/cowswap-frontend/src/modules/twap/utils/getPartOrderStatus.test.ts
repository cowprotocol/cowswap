import { EnrichedOrder, OrderKind, SigningScheme } from '@cowprotocol/cow-sdk'

import { OrderStatus } from 'legacy/state/orders/actions'

import { getPartOrderStatus } from './getPartOrderStatus'

import { DEFAULT_TWAP_EXECUTION_INFO } from '../const'
import { TwapOrderItem, TwapOrderStatus } from '../types'

const baseParentOrder: TwapOrderItem = {
  id: 'parent-order',
  chainId: 1,
  submissionDate: new Date('2026-03-09T10:00:00.000Z').toISOString(),
  safeAddress: '0x0000000000000000000000000000000000000001',
  status: TwapOrderStatus.Pending,
  executionInfo: {
    confirmedPartsCount: 0,
    info: DEFAULT_TWAP_EXECUTION_INFO,
  },
  order: {
    sellToken: '0x0000000000000000000000000000000000000002',
    buyToken: '0x0000000000000000000000000000000000000003',
    receiver: '0x0000000000000000000000000000000000000001',
    partSellAmount: '100',
    minPartLimit: '50',
    t0: 0,
    n: 4,
    t: 300,
    span: 0,
    appData: '0x00',
  },
}

const expiredPartOrder = {
  uid: 'part-order',
  buyAmount: '50',
  sellAmount: '100',
  executedBuyAmount: '0',
  executedSellAmountBeforeFees: '0',
  validTo: Math.floor(Date.now() / 1000) - 60 * 60,
  invalidated: false,
  status: OrderStatus.PENDING,
  kind: OrderKind.SELL,
  signingScheme: SigningScheme.EIP1271,
  creationDate: new Date('2026-03-09T10:05:00.000Z').toISOString(),
} as unknown as EnrichedOrder

describe('getPartOrderStatus()', () => {
  it('keeps cancelling parent parts non-final even when the part is time-expired', () => {
    const status = getPartOrderStatus(
      expiredPartOrder,
      { ...baseParentOrder, status: TwapOrderStatus.Cancelling },
      true,
    )

    expect(status).toBe(OrderStatus.SCHEDULED)
  })
})
