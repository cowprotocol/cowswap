import { useEffect } from 'react'

import { getAddress } from '@ethersproject/address'
import { Token } from '@uniswap/sdk-core'

import { useActiveWeb3React } from 'hooks/web3'
import { useAddOrUpdateOrdersBatch } from 'state/orders/hooks'
import { getOrders } from 'api/gnosisProtocol/api'
import { useAllTokens } from 'hooks/Tokens'
import { Order, OrderStatus } from 'state/orders/actions'
import { NATIVE_CURRENCY_BUY_ADDRESS, NATIVE_CURRENCY_BUY_TOKEN } from 'constants/index'
import { ChainId } from 'state/lists/actions'
import { ApiOrderStatus, classifyOrder } from 'state/orders/utils'

function getToken(address: string, chainId: ChainId, tokens: { [p: string]: Token }): Token | undefined {
  if (address.toLowerCase() === NATIVE_CURRENCY_BUY_ADDRESS.toLowerCase()) {
    return NATIVE_CURRENCY_BUY_TOKEN[chainId]
  }
  return tokens[getAddress(address)]
}

function classifyLocalStatus(status: ApiOrderStatus): OrderStatus | undefined {
  switch (status) {
    case 'cancelled':
      return OrderStatus.CANCELLED
    case 'expired':
      return OrderStatus.EXPIRED
    case 'pending':
      return OrderStatus.PENDING
    case 'fulfilled':
      return OrderStatus.FULFILLED
    default:
      return undefined
  }
}

export function APIOrdersUpdater(): null {
  const { account, chainId } = useActiveWeb3React()
  const allTokens = useAllTokens()
  const addOrUpdateOrdersBatch = useAddOrUpdateOrdersBatch()

  useEffect(() => {
    if (account && chainId && Object.keys(allTokens).length > 0) {
      getOrders(chainId, account, 100)
        .then((_orders) => {
          console.log(`APIOrdersUpdater::Fetched ${_orders.length} orders for account ${account} on chain ${chainId}`)

          // Transform API orders into internal order objects
          const orders = _orders.reduce<Order[]>((acc, order) => {
            const { uid: id, sellToken, buyToken, creationDate: creationTime, receiver } = order

            // TODO: load tokens from network when not found on local state
            const inputToken = getToken(sellToken, chainId, allTokens)
            const outputToken = getToken(buyToken, chainId, allTokens)

            const apiStatus = classifyOrder(order)
            const status = classifyLocalStatus(apiStatus)
            if (!status) {
              console.warn(`APIOrdersUpdater::Order ${id} in unknown internal state: ${apiStatus}`)
              return acc
            }

            if (inputToken && outputToken) {
              acc.push({
                ...order,
                inputToken,
                outputToken,
                id,
                creationTime,
                summary: 'TODO: loaded from API',
                status,
                receiver,
                apiAdditionalInfo: order,
              })
            } else {
              console.warn(
                `APIOrdersUpdater::Tokens not found for order ${id}: sellToken ${
                  !inputToken ? sellToken : 'found'
                } - buyToken ${!outputToken ? buyToken : 'found'}`
              )
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
  }, [account, addOrUpdateOrdersBatch, allTokens, chainId])

  return null
}
