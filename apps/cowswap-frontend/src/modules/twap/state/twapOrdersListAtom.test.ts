import { createStore } from 'jotai'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { walletInfoAtom } from '@cowprotocol/wallet'

import { eoaTwapOrdersAtom, twapOrdersAtom, type TwapOrderItem } from 'entities/twap'

import { setTwapOrderStatusAtom } from './twapOrdersListAtom'

import { TwapOrderStatus } from '../types'

const OWNER = '0x1111111111111111111111111111111111111111'

describe('setTwapOrderStatusAtom', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('updates an indexed EOA TWAP order', () => {
    const store = createStore()
    const order = makeOrder('indexed-event')
    const optimisticOrder = { ...order, id: `hash-${order.id}` }
    store.set(walletInfoAtom, { account: OWNER, chainId: SupportedChainId.GNOSIS_CHAIN })
    store.set(eoaTwapOrdersAtom, { [order.id]: order })
    store.set(twapOrdersAtom, { [optimisticOrder.id]: optimisticOrder })

    store.set(setTwapOrderStatusAtom, order.id, TwapOrderStatus.Cancelling)
    expect(store.get(eoaTwapOrdersAtom)[order.id]?.status).toBe(TwapOrderStatus.Cancelling)
    expect(store.get(twapOrdersAtom)[optimisticOrder.id]?.status).toBe(TwapOrderStatus.Cancelling)

    store.set(setTwapOrderStatusAtom, order.id, TwapOrderStatus.Cancelled)
    expect(store.get(eoaTwapOrdersAtom)[order.id]?.status).toBe(TwapOrderStatus.Cancelled)
    expect(store.get(twapOrdersAtom)[optimisticOrder.id]?.status).toBe(TwapOrderStatus.Cancelled)
  })
})

function makeOrder(id: string): TwapOrderItem {
  return {
    id,
    hash: `hash-${id}`,
    chainId: SupportedChainId.GNOSIS_CHAIN,
    safeAddress: '0x2222222222222222222222222222222222222222',
    resolvedOwner: OWNER,
    status: TwapOrderStatus.Pending,
    submissionDate: new Date(0).toISOString(),
    order: {
      sellToken: '0x3333333333333333333333333333333333333333',
      buyToken: '0x4444444444444444444444444444444444444444',
      receiver: OWNER,
      partSellAmount: '1',
      minPartLimit: '1',
      t0: 0,
      n: 1,
      t: 60,
      span: 0,
      appData: `0x${'00'.repeat(32)}`,
    },
    executionInfo: {
      confirmedPartsCount: 0,
      info: { executedSellAmount: '0', executedBuyAmount: '0', executedFeeAmount: '0' },
    },
    partOrdersCount: 0,
  }
}
