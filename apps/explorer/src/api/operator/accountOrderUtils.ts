import { useEffect, useMemo, useRef } from 'react'

import { EnrichedOrder, SupportedChainId } from '@cowprotocol/cow-sdk'

import { orderBookSDK } from 'cowSdk'
import { useMultipleErc20 } from 'hooks/useErc20'
import localforage from 'localforage'
import useSWRInfinite from 'swr/infinite'
import { useAsyncMemo } from 'use-async-memo'
import { transformOrder } from 'utils'

import { GetAccountOrdersParams, Order, RawOrder } from './types'

type AccountOrders = Record<string, Record<SupportedChainId, EnrichedOrder[]>>

const KEY = 'accountOrders:v0'

async function getAccountOrdersFromStorage(
  networkId: SupportedChainId | undefined,
  owner: string,
): Promise<EnrichedOrder[]> {
  const accountOrders = await localforage.getItem(KEY)
  if (!accountOrders || !networkId) return []

  const ordersPerNetwork = accountOrders[owner.toLowerCase()]
  if (!ordersPerNetwork) return []

  const orders = ordersPerNetwork[networkId] // TODO: may need to parse/hydrate it

  return orders
}

async function appendAccountOrdersToStorage(
  networkId: SupportedChainId,
  owner: string,
  orders: EnrichedOrder[],
): Promise<void> {
  const accountOrders = (await localforage.getItem(KEY)) || {}
  const ordersPerNetwork = accountOrders[owner.toLowerCase()] || {}
  const existingOrders = ordersPerNetwork[networkId] || []
  const mergedOrders = [...existingOrders, ...orders].filter((v, i, a) => a.findIndex((v2) => v2.uid === v.uid) === i) // remove duplicated orders

  if (existingOrders.length === mergedOrders.length) return // no new orders

  ordersPerNetwork[networkId] = mergedOrders

  console.log(`fuck:[AccountOrdersUpdater] Saving ${mergedOrders.length} orders for ${owner} on ${networkId}`)

  await localforage.setItem(KEY, { ...accountOrders, [owner.toLowerCase()]: ordersPerNetwork })
}

export function AccountOrdersUpdater({
  networkId,
  owner,
}: {
  networkId: SupportedChainId | undefined
  owner: string | undefined
}): null {
  const { orders, isLoading } = useGetAllAccountOrders(networkId, owner)
  const prevOrdersRef = useRef<EnrichedOrder[]>([])

  useEffect(() => {
    console.log(`fuck:AccountOrdersUpdater`, { networkId, owner, orders, isLoading }, orders.length)
    if (isLoading || !networkId || !owner) return

    // Only update storage if orders have actually changed
    const ordersChanged =
      orders.length !== prevOrdersRef.current.length ||
      orders.some((order, index) => order.uid !== prevOrdersRef.current[index]?.uid)

    if (ordersChanged) {
      console.log(`fuck:[AccountOrdersUpdater] Updating storage with ${orders.length} orders`)
      appendAccountOrdersToStorage(networkId, owner, orders)
      prevOrdersRef.current = orders
    }
  }, [orders, isLoading, networkId, owner])

  return null
}

export function useAllAccountOrders(networkId: SupportedChainId | undefined, owner: string): EnrichedOrder[] {
  return useAsyncMemo(async () => getAccountOrdersFromStorage(networkId, owner), [networkId, owner], [])
}

export function useAllAccountOrdersWithTokenInfo(networkId: SupportedChainId | undefined, owner: string): Order[] {
  const orders = useAllAccountOrders(networkId, owner)
  console.log(`fuck:useAllAccountOrdersWithTokenInfo`, { networkId, owner, orders }, orders.length)

  const erc20Addresses = [
    ...orders
      .reduce<Set<string>>((acc, order) => {
        acc.add(order.buyToken.toLowerCase())
        acc.add(order.sellToken.toLowerCase())

        return acc
      }, new Set())
      .values(),
  ]

  const { value: valueErc20s, isLoading: areErc20Loading } = useMultipleErc20({ networkId, addresses: erc20Addresses })
  console.log(
    `fuck:useAllAccountOrdersWithTokenInfo: after loading tokens`,
    { networkId, owner, orders },
    valueErc20s,
    areErc20Loading,
  )

  return areErc20Loading
    ? []
    : orders.map((order) => {
        const o = transformOrder(order)
        o.buyToken = valueErc20s[order.buyToken.toLowerCase()] || o.buyToken
        o.sellToken = valueErc20s[order.sellToken.toLowerCase()] || o.sellToken

        return o
      })
}

const PAGE_SIZE = 999

function buildGetSwrKey(networkId: SupportedChainId | undefined, owner: string | undefined) {
  return function getSwrKey(
    index: number,
    previousPageData: AccountOrdersPage,
  ): [string, SupportedChainId, string, number, boolean, boolean] | null {
    console.log(`fuck:buildGetSwrKey`, { index, previousPageData, networkId, owner })
    // Reached the end of the list
    if (!networkId || !owner || (previousPageData && !previousPageData.prodHasNext && !previousPageData.barnHasNext))
      return null

    // First page
    if (index === 0) {
      return ['getAccountOrders', networkId, owner, 0, true, true]
    }

    // Next pages
    const offset = index * PAGE_SIZE
    return ['getAccountOrders', networkId, owner, offset, previousPageData.prodHasNext, previousPageData.barnHasNext]
  }
}

const EMPTY_ORDERS: EnrichedOrder[] = []

export function useGetAllAccountOrders(networkId: SupportedChainId | undefined, owner: string | undefined) {
  const getKey = useMemo(() => buildGetSwrKey(networkId, owner), [networkId, owner])

  const { data, isLoading } = useSWRInfinite(
    getKey,
    async ([_, _networkId, _owner, offset, fetchProdOrders, fetchBarnOrders]) =>
      getAccountOrdersPage(_networkId, _owner, offset, PAGE_SIZE, fetchProdOrders, fetchBarnOrders),
    { initialSize: 10, revalidateFirstPage: false, persistSize: false },
  )

  const orders = useMemo(() => data?.flatMap((page) => page.orders) ?? EMPTY_ORDERS, [data])

  return useMemo(() => {
    console.log(`fuck:useGetAllAccountOrders`, orders.length, isLoading)
    return {
      orders,
      isLoading,
      hasNextPage: Boolean(data?.[data.length - 1]?.prodHasNext || data?.[data.length - 1]?.barnHasNext),
    }
  }, [orders, isLoading, data])
}

type AccountOrdersPage = { orders: EnrichedOrder[]; prodHasNext: boolean; barnHasNext: boolean }

async function getAccountOrdersPage(
  networkId: SupportedChainId,
  owner: string,
  offset: number,
  limit: number = 1000,
  fetchProdOrders: boolean = true,
  fetchBarnOrders: boolean = true,
): Promise<AccountOrdersPage> {
  const prodOrdersPromise = fetchProdOrders
    ? orderBookSDK.getOrders({ owner, offset, limit: limit + 1 }, { chainId: networkId }).catch((error) => {
        console.error('[getAccountOrders] Error getting PROD orders for account', owner, networkId, error)
        return []
      })
    : Promise.resolve([])
  const barnOrdersPromise = fetchBarnOrders
    ? orderBookSDK
        .getOrders({ owner, offset, limit: limit + 1 }, { chainId: networkId, env: 'staging' })
        .catch((error) => {
          console.error('[getAccountOrders] Error getting BARN orders for account', owner, networkId, error)
          return []
        })
    : Promise.resolve([])

  const [prodOrders, barnOrders] = await Promise.all([prodOrdersPromise, barnOrdersPromise])

  // Merge and sort orders by creation date
  const orders = [...prodOrders, ...barnOrders].sort(
    (o1, o2) => new Date(o2.creationDate).getTime() - new Date(o1.creationDate).getTime(),
  )

  console.log(`fuck:getAccountOrdersPage`, { networkId, owner, offset, limit }, orders.length)

  return {
    orders,
    prodHasNext: prodOrders.length > limit,
    barnHasNext: barnOrders.length > limit,
  }
}

/**
 * Gets a list of orders of one user paginated
 *
 * Optional filters:
 *  - owner: address
 *  - offset: int
 *  - limit: int
 */
export async function getAccountOrders(params: GetAccountOrdersParams): Promise<GetAccountOrdersResponse> {
  const { networkId, owner, offset = 0, limit = 20 } = params
  const state = getState({ networkId, owner, limit })
  const limitPlusOne = limit + 1

  const currentPage = Math.round(offset / limit)
  const cachedPageOrders = state.merged.get(currentPage)

  if (cachedPageOrders) {
    return {
      orders: [...cachedPageOrders],
      hasNextPage: Boolean(state.merged.get(currentPage + 1)) || state.unmerged.length > 0,
    }
  }

  const ordersPromise = state.prodHasNext
    ? orderBookSDK.getOrders({ owner, offset, limit: limitPlusOne }, { chainId: networkId }).catch((error) => {
        console.error('[getAccountOrders] Error getting PROD orders for account', owner, networkId, error)
        return []
      })
    : []

  const ordersPromiseBarn = state.barnHasNext
    ? orderBookSDK
        .getOrders({ owner, offset, limit: limitPlusOne }, { chainId: networkId, env: 'staging' })
        .catch((error) => {
          console.error('[getAccountOrders] Error getting BARN orders for account', owner, networkId, error)
          return []
        })
    : []

  const [prodOrders, barnOrders] = await Promise.all([ordersPromise, ordersPromiseBarn])

  state.prodHasNext = prodOrders.length === limitPlusOne
  if (state.prodHasNext) {
    state.prodPage += 1
  }

  state.barnHasNext = barnOrders.length === limitPlusOne
  if (state.barnHasNext) {
    state.barnPage += 1
  }

  const mergedEnvs = [...prodOrders, ...barnOrders, ...state.unmerged]
    .filter((v, i, a) => a.findIndex((v2) => v2.uid === v.uid) === i) // remove duplicated orders
    .sort((o1, o2) => new Date(o2.creationDate).getTime() - new Date(o1.creationDate).getTime())

  const currentPageOrders = mergedEnvs.slice(0, limit)
  state.merged.set(currentPage, currentPageOrders)

  if (mergedEnvs.length > limit) {
    state.unmerged = mergedEnvs.slice(limit)
  } else {
    state.unmerged = []
  }

  return { orders: [...currentPageOrders], hasNextPage: state.unmerged.length > 0 }
}

const userOrdersCache = new Map<string, CacheState>()

export type GetAccountOrdersResponse = {
  orders: RawOrder[]
  hasNextPage: boolean
}

type CacheKey = {
  networkId: SupportedChainId
  owner: string
  limit: number
}

type CacheState = {
  merged: Map<number, EnrichedOrder[]>
  unmerged: EnrichedOrder[]
  prodPage: number
  prodHasNext: boolean
  barnPage: number
  barnHasNext: boolean
}

const emptyState = (): CacheState => ({
  merged: new Map<number, EnrichedOrder[]>(),
  unmerged: [] as EnrichedOrder[],
  prodPage: 0,
  prodHasNext: true,
  barnPage: 0,
  barnHasNext: true,
})

const getState = (cacheKey: CacheKey): CacheState => {
  const key = JSON.stringify(cacheKey)
  const cachedState = userOrdersCache.get(key)

  if (!cachedState) {
    userOrdersCache.set(key, emptyState())
    console.debug('User Orders: Cache reset', { key })
  }

  return userOrdersCache.get(key) ?? emptyState()
}
