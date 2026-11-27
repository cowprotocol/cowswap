import { createStore } from 'jotai'

import { QueryClient } from '@tanstack/react-query'

import { queryClientAtom } from 'jotai-tanstack-query'

import { openOrdersQueryAtomFamily } from './accountQueryAtoms'
import { setOrderCancellationAtom } from './orderCancellations'

import { getOpenOrders } from '../api/openOrders'
import { AAPLX_MAINNET, OWNER } from '../lib/fixtures'

jest.mock('../api/openOrders', () => ({ getOpenOrders: jest.fn() }))
jest.mock('../api/activity', () => ({ activityProvider: { getActivity: jest.fn() } }))

describe('openOrdersQueryAtomFamily', () => {
  it('leaves out the orders whose cancellation is confirmed, before the API drops them', async () => {
    ;(getOpenOrders as jest.Mock).mockResolvedValue([{ uid: 'twap' }, { uid: 'limit' }, { uid: 'pending' }])

    const queryClient = new QueryClient()
    const store = createStore()

    store.set(queryClientAtom, queryClient)

    const queryAtom = openOrdersQueryAtomFamily({ owner: OWNER, scope: 'cancel-test', tokens: [AAPLX_MAINNET] })
    const unsubscribe = store.sub(queryAtom, () => undefined)

    await queryClient.fetchQuery({ queryKey: queryClient.getQueryCache().getAll()[0].queryKey })
    store.set(setOrderCancellationAtom, 'twap', { status: 'cancelled', type: 'hard' })
    store.set(setOrderCancellationAtom, 'pending', { status: 'pending', type: 'hard', txHash: '0x01' })

    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(store.get(queryAtom).data?.map(({ uid }) => uid)).toEqual(['limit', 'pending'])

    unsubscribe()
    queryClient.clear()
  })
})
