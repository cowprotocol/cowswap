import { useEffect, useMemo } from 'react'

import { getAddress } from '@ethersproject/address'
import { Token } from '@uniswap/sdk-core'

import { useActiveWeb3React } from 'hooks/web3'
import { useAddOrUpdateOrdersBatch } from 'state/orders/hooks'
import { getOrders, OrderMetaData } from 'api/gnosisProtocol/api'
import { useAllTokens } from 'hooks/Tokens'
import { Order, OrderStatus } from 'state/orders/actions'
import { AMOUNT_OF_ORDERS_TO_FETCH, NATIVE_CURRENCY_BUY_ADDRESS, NATIVE_CURRENCY_BUY_TOKEN } from 'constants/index'
import { ChainId } from 'state/lists/actions'
import { ApiOrderStatus, classifyOrder } from 'state/orders/utils'
import { computeOrderSummary } from 'state/orders/updaters/utils'

function getToken(address: string, chainId: ChainId, tokens: { [p: string]: Token }): Token | undefined {
  if (address.toLowerCase() === NATIVE_CURRENCY_BUY_ADDRESS.toLowerCase()) {
    return NATIVE_CURRENCY_BUY_TOKEN[chainId]
  }
  return tokens[getAddress(address)]
}

const statusMapping: Record<ApiOrderStatus, OrderStatus | undefined> = {
  cancelled: OrderStatus.CANCELLED,
  expired: OrderStatus.EXPIRED,
  fulfilled: OrderStatus.FULFILLED,
  pending: OrderStatus.PENDING,
  unknown: undefined,
}

function transformApiOrderToStoreOrder(
  order: OrderMetaData,
  chainId: ChainId,
  allTokens: { [address: string]: Token }
): Order | undefined {
  const { uid: id, sellToken, buyToken, creationDate: creationTime, receiver } = order

  // TODO: load tokens from network when not found on local state
  const inputToken = getToken(sellToken, chainId, allTokens)
  const outputToken = getToken(buyToken, chainId, allTokens)

  const apiStatus = classifyOrder(order)
  const status = statusMapping[apiStatus]

  if (!status) {
    console.warn(`APIOrdersUpdater::Order ${id} in unknown internal state: ${apiStatus}`)
    return
  }

  if (inputToken && outputToken) {
    const storeOrder: Order = {
      ...order,
      inputToken,
      outputToken,
      id,
      creationTime,
      summary: '',
      status,
      receiver,
      apiAdditionalInfo: order,
      isCancelling: apiStatus === 'pending' && order.invalidated, // already cancelled in the API, not yet in the UI
    }
    // The function to compute the summary needs the Order instance to exist already
    // That's why it's not used before and an empty string is set instead
    storeOrder.summary = computeOrderSummary({ orderFromStore: storeOrder, orderFromApi: order }) || ''

    return storeOrder
  } else {
    console.warn(
      `APIOrdersUpdater::Tokens not found for order ${id}: sellToken ${!inputToken ? sellToken : 'found'} - buyToken ${
        !outputToken ? buyToken : 'found'
      }`
    )
    return
  }
}

export function ApiOrdersUpdater(): null {
  const { account, chainId } = useActiveWeb3React()
  const allTokens = useAllTokens()
  const tokenAreLoaded = useMemo(() => Object.keys(allTokens).length > 0, [allTokens])
  const addOrUpdateOrdersBatch = useAddOrUpdateOrdersBatch()

  useEffect(() => {
    if (account && chainId && tokenAreLoaded) {
      getOrders(chainId, account, AMOUNT_OF_ORDERS_TO_FETCH)
        .then((apiOrders) => {
          console.log(`APIOrdersUpdater::Fetched ${apiOrders.length} orders for account ${account} on chain ${chainId}`)

          // Transform API orders into internal order objects and filter out orders that are not in a known state
          const orders = apiOrders.reduce<Order[]>((acc, order) => {
            const storeOrder = transformApiOrderToStoreOrder(order, chainId, allTokens)
            if (storeOrder) {
              acc.push(storeOrder)
            }
            return acc
          }, [])

          // Add to redux state
          addOrUpdateOrdersBatch({ orders, chainId })
        })
        .catch((e) => {
          console.error(`APIOrdersUpdater::Failed to fetch orders`, e)
        })
    }
  }, [account, addOrUpdateOrdersBatch, allTokens, chainId, tokenAreLoaded])

  return null
}
