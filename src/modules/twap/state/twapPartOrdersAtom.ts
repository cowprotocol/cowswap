import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { OrderParameters, SupportedChainId } from '@cowprotocol/cow-sdk'

import { walletInfoAtom } from 'modules/wallet/api/state'

import { deepEqual } from 'utils/deepEqual'

export interface TwapPartOrderItem {
  uid: string
  index: number
  chainId: SupportedChainId
  safeAddress: string
  twapOrderId: string
  isCreatedInOrderBook: boolean
  order: OrderParameters
}
export type TwapPartOrders = { [twapOrderHash: string]: TwapPartOrderItem[] }

export const twapPartOrdersAtom = atomWithStorage<TwapPartOrders>('twap-part-orders-list:v1', {})

/**
 * The only goal of this function is protection from isCreatedInOrderBook flag overriding
 */
export const updatePartOrdersAtom = atom(null, (get, set, nextState: TwapPartOrders) => {
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
        isCreatedInOrderBook: currentItemsMap[item.uid]?.isCreatedInOrderBook || item.isCreatedInOrderBook,
      }
    })

    return acc
  }, {})

  set(twapPartOrdersAtom, newState)
})

export const markPartOrdersAsCreatedAtom = atom(null, (get, set, update: { [parentId: string]: string[] }) => {
  const currentState = get(twapPartOrdersAtom)
  const parentsIds = Object.keys(update)

  if (!parentsIds.length) return

  const newState = parentsIds.reduce<TwapPartOrders>(
    (acc, parentId) => {
      const createdOrdersIds = update[parentId]

      acc[parentId] = (currentState[parentId] || []).map((item) => {
        if (createdOrdersIds.includes(item.uid)) {
          return { ...item, isCreatedInOrderBook: true }
        }

        return item
      })

      return acc
    },
    { ...currentState }
  )

  if (!deepEqual(currentState, newState)) {
    set(twapPartOrdersAtom, newState)
  }
})

export const twapPartOrdersListAtom = atom<TwapPartOrderItem[]>((get) => {
  const { account, chainId } = get(walletInfoAtom)

  if (!account || !chainId) return []

  const accountLowerCase = account.toLowerCase()

  const orders = Object.values(get(twapPartOrdersAtom))

  return orders.flat().filter((order) => order.safeAddress === accountLowerCase && order.chainId === chainId)
})
