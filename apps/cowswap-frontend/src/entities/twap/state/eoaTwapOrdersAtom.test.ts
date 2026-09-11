import { createStore } from 'jotai'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { walletInfoAtom } from '@cowprotocol/wallet'

import type { TwapOrderItem } from 'modules/twap'

import { eoaTwapOrdersAtom } from './eoaTwapOrdersAtom'

const OWNER_A = '0x1111111111111111111111111111111111111111'
const OWNER_B = '0x2222222222222222222222222222222222222222'
const CHAIN_ID = SupportedChainId.GNOSIS_CHAIN

describe('eoaTwapOrdersAtom', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('isolates persisted owner buckets and restores a bucket when switching back', () => {
    const store = createStore()
    const orderA = makeOrder('event-a', OWNER_A)
    const orderB = makeOrder('event-b', OWNER_B)

    store.set(walletInfoAtom, { account: OWNER_A, chainId: CHAIN_ID })
    store.set(eoaTwapOrdersAtom, { [orderA.id]: orderA })

    store.set(walletInfoAtom, { account: OWNER_B, chainId: CHAIN_ID })
    expect(store.get(eoaTwapOrdersAtom)).toEqual({})

    store.set(eoaTwapOrdersAtom, { [orderB.id]: orderB })
    expect(store.get(eoaTwapOrdersAtom)).toEqual({ [orderB.id]: orderB })

    store.set(walletInfoAtom, { account: OWNER_A, chainId: CHAIN_ID })
    expect(store.get(eoaTwapOrdersAtom)).toEqual({ [orderA.id]: orderA })
  })

  it('writes a reloadable cache entry to browser storage', () => {
    const order = makeOrder('cached-event', OWNER_A)
    const store = createStore()
    store.set(walletInfoAtom, { account: OWNER_A, chainId: CHAIN_ID })
    store.set(eoaTwapOrdersAtom, { [order.id]: order })

    const persisted = JSON.parse(String(localStorage.getItem('eoa-twap-orders:v1'))) as Record<string, unknown>
    expect(Object.values(persisted)).toEqual([{ [order.id]: order }])
    expect(store.get(eoaTwapOrdersAtom)).toEqual({ [order.id]: order })
  })

  it('caps each persisted bucket at the newest 1000 parents', () => {
    const store = createStore()
    const orders = Array.from({ length: 1001 }, (_, index) => makeOrder(`event-${index}`, OWNER_A, index)).reduce<
      Record<string, TwapOrderItem>
    >((result, order) => {
      result[order.id] = order
      return result
    }, {})

    store.set(walletInfoAtom, { account: OWNER_A, chainId: CHAIN_ID })
    store.set(eoaTwapOrdersAtom, orders)

    const cached = store.get(eoaTwapOrdersAtom)
    expect(Object.keys(cached)).toHaveLength(1000)
    expect(cached['event-1000']).toBeDefined()
    expect(cached['event-0']).toBeUndefined()
  })
})

function makeOrder(id: string, resolvedOwner: string, createdAt = 0): TwapOrderItem {
  const date = new Date(createdAt * 1000).toISOString()

  return {
    id,
    hash: `hash-${id}`,
    chainId: CHAIN_ID,
    safeAddress: '0x3333333333333333333333333333333333333333',
    resolvedOwner,
    status: 'Pending' as TwapOrderItem['status'],
    submissionDate: date,
    executedDate: date,
    order: {
      sellToken: '0x4444444444444444444444444444444444444444',
      buyToken: '0x5555555555555555555555555555555555555555',
      receiver: resolvedOwner,
      partSellAmount: '1',
      minPartLimit: '1',
      t0: createdAt,
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
