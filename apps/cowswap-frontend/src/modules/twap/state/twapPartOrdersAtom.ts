import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { deepEqual } from '@cowprotocol/common-utils'
import { getJotaiIsolatedStorage } from '@cowprotocol/core'
import { OrderParameters, SupportedChainId } from '@cowprotocol/cow-sdk'
import { walletInfoAtom } from '@cowprotocol/wallet'

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

export const twapPartOrdersAtom = atomWithStorage<TwapPartOrders>(
  'twap-part-orders-list:v1',
  {},
  getJotaiIsolatedStorage()
)

/**
 * The only goal of this function is protection from isCreatedInOrderBook flag overriding
 */
export const setPartOrdersAtom = atom(null, (get, set, nextState: TwapPartOrders) => {
  const currentState = get(twapPartOrdersAtom)

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
          acc[val] = (currentItemsMap[item.uid]?.[val] || item[val]) as any
          return acc
        }, {}),
      }
    })

    return acc
  }, {})

  set(twapPartOrdersAtom, newState)
})

export const updatePartOrdersAtom = atom(
  null,
  (get, set, updates: { [orderId: string]: Partial<TwapPartOrderItem> }) => {
    const currentState = get(twapPartOrdersAtom)

    const newState = Object.keys(currentState).reduce<TwapPartOrders>((acc, parentId) => {
      acc[parentId] = currentState[parentId].map((item) => {
        const update = updates[item.uid]

        return update ? { ...item, ...update } : item
      })

      return acc
    }, {})

    if (!deepEqual(currentState, newState)) {
      set(twapPartOrdersAtom, newState)
    }
  }
)

export const twapPartOrdersListAtom = atom<TwapPartOrderItem[]>((get) => {
  const { account, chainId } = get(walletInfoAtom)

  if (!account || !chainId) return []

  const accountLowerCase = account.toLowerCase()

  const orders = Object.values(get(twapPartOrdersAtom))

  return orders.flat().filter((order) => order.safeAddress === accountLowerCase && order.chainId === chainId)
})
