import { createStore } from 'jotai'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { UiOrderType } from '@cowprotocol/types'
import { walletInfoAtom } from '@cowprotocol/wallet'

import { triggerAppziSurvey } from 'appzi'
import { eoaTwapOrdersAtom, twapOrdersAtom, type TwapOrderItem } from 'entities/twap'

import { addTwapOrderToListAtom, setTwapOrderStatusAtom } from './twapOrdersListAtom'

import { TwapOrderStatus } from '../types'

const OWNER = '0x1111111111111111111111111111111111111111'

jest.mock('appzi', () => ({ getSurveyType: () => 'nps', triggerAppziSurvey: jest.fn() }))

describe('addTwapOrderToListAtom', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  it('triggers the NPS survey once for a newly placed EOA parent', () => {
    const store = createStore()
    const order = makeOrder('parent-hash')
    store.set(walletInfoAtom, { account: OWNER, chainId: order.chainId })

    store.set(addTwapOrderToListAtom, order)
    store.set(addTwapOrderToListAtom, order)

    expect(triggerAppziSurvey).toHaveBeenCalledTimes(1)
    expect(triggerAppziSurvey).toHaveBeenCalledWith(
      expect.objectContaining({
        created: true,
        orderType: UiOrderType.TWAP,
        chainId: order.chainId,
        account: OWNER,
        pendingOrderIds: order.id,
      }),
      'nps',
    )
  })

  it('waits for Safe signing before triggering a creation survey', () => {
    const store = createStore()
    const order = { ...makeOrder('safe-hash'), safeAddress: OWNER, status: TwapOrderStatus.WaitSigning }
    store.set(walletInfoAtom, { account: OWNER, chainId: order.chainId })

    store.set(addTwapOrderToListAtom, order)

    expect(store.get(twapOrdersAtom)[order.id]).toEqual(order)
    expect(triggerAppziSurvey).not.toHaveBeenCalled()
  })

  it('does not show feedback for a placement belonging to another wallet or chain', () => {
    const store = createStore()
    const order = makeOrder('parent-hash')
    store.set(walletInfoAtom, { account: order.safeAddress, chainId: order.chainId })
    store.set(addTwapOrderToListAtom, order)
    store.set(walletInfoAtom, { account: OWNER, chainId: SupportedChainId.MAINNET })
    store.set(addTwapOrderToListAtom, { ...order, id: 'another-parent' })

    expect(triggerAppziSurvey).not.toHaveBeenCalled()
  })
})

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
      info: { executedSellAmount: '0', executedBuyAmount: '0', executedFee: '0' },
    },
    partOrdersCount: 0,
  }
}
