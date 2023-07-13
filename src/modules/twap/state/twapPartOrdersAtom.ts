import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { OrderParameters, SupportedChainId } from '@cowprotocol/cow-sdk'

import { walletInfoAtom } from 'modules/wallet/api/state'

export interface TwapPartOrderItem {
  uid: string
  index: number
  chainId: SupportedChainId
  safeAddress: string
  twapOrderId: string
  isSettledInOrderBook: boolean
  order: OrderParameters
}
export type TwapPartOrders = { [twapOrderHash: string]: TwapPartOrderItem[] }

export const twapPartOrdersAtom = atomWithStorage<TwapPartOrders>('twap-part-orders-list:v6', {})

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
        isSettledInOrderBook: currentItemsMap[item.uid]?.isSettledInOrderBook || item.isSettledInOrderBook,
      }
    })

    return acc
  }, {})

  set(twapPartOrdersAtom, newState)
})

export const markPartOrdersAsSettledAtom = atom(null, (get, set, update: { [parentId: string]: string[] }) => {
  const currentState = get(twapPartOrdersAtom)
  const parentsIds = Object.keys(update)

  if (!parentsIds.length) return

  const newState = parentsIds.reduce<TwapPartOrders>((acc, parentId) => {
    const settledIds = update[parentId]

    acc[parentId] = currentState[parentId].map((item) => {
      if (settledIds.includes(item.uid)) {
        return { ...item, isSettledInOrderBook: true }
      }

      return item
    })

    return acc
  }, currentState)

  set(twapPartOrdersAtom, newState)
})

export const twapPartOrdersListAtom = atom<TwapPartOrderItem[]>((get) => {
  const { account, chainId } = get(walletInfoAtom)

  if (!account || !chainId) return []

  const accountLowerCase = account.toLowerCase()

  const orders = Object.values(get(twapPartOrdersAtom))

  return orders.flat().filter((order) => order.safeAddress === accountLowerCase && order.chainId === chainId)
})
