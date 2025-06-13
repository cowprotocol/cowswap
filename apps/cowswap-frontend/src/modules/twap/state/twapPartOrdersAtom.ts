import { atom } from 'jotai'

import { deepEqual } from '@cowprotocol/common-utils'
import { atomWithIdbStorage } from '@cowprotocol/core'
import { OrderParameters, SupportedChainId } from '@cowprotocol/cow-sdk'

export interface TwapPartOrderItem {
  uid: string
  index: number
  chainId: SupportedChainId
  safeAddress: string
  twapOrderId: string
  isCreatedInOrderBook: boolean
  isCancelling: boolean
  order: OrderParameters
}

export type TwapPartOrders = { [twapOrderHash: string]: TwapPartOrderItem[] }

// Fields that are stored only in localStorage
const virtualFields: (keyof TwapPartOrderItem)[] = ['isCreatedInOrderBook', 'isCancelling']

// Migrating from localStorage to indexedDB
localStorage.removeItem('twap-part-orders-list:v1')

export const twapPartOrdersAtom = atomWithIdbStorage<TwapPartOrders>('twap-part-orders-list:v1', {})

/**
 * The only goal of this function is protection from isCreatedInOrderBook flag overriding
 */
export const setPartOrdersAtom = atom(null, async (get, set, nextState: TwapPartOrders) => {
  const currentState = await get(twapPartOrdersAtom)

  const newState = Object.keys(nextState).reduce<TwapPartOrders>((acc, parentId) => {
    const items = nextState[parentId]
    const currentItemsMap = (currentState[parentId] || []).reduce<{ [id: string]: TwapPartOrderItem }>((acc, val) => {
      acc[val.uid] = val
      return acc
    }, {})

    acc[parentId] = items.map((item) => {
      return {
        ...item,
        // We need to keep virtual fields from the previous state if they are present in it
        // Because they get updates from `useSetPartOrderCancelling` and `CreatedInOrderBookOrdersUpdater`
        ...virtualFields.reduce<Partial<TwapPartOrderItem>>((acc, val) => {
          // TODO: Replace any with proper type definitions
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          acc[val] = (currentItemsMap[item.uid]?.[val] || item[val]) as any
          return acc
        }, {}),
      }
    })

    return acc
  }, {})

  await set(twapPartOrdersAtom, newState)
})

export const updatePartOrdersAtom = atom(
  null,
  async (get, set, updates: { [orderId: string]: Partial<TwapPartOrderItem> }) => {
    const currentState = await get(twapPartOrdersAtom)

    const newState = Object.keys(currentState).reduce<TwapPartOrders>((acc, parentId) => {
      acc[parentId] = currentState[parentId].map((item) => {
        const update = updates[item.uid]

        return update ? { ...item, ...update } : item
      })

      return acc
    }, {})

    if (!deepEqual(currentState, newState)) {
      await set(twapPartOrdersAtom, newState)
    }
  },
)
