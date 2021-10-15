import { useEffect, useCallback, useMemo, useRef } from 'react'

import { getAddress } from '@ethersproject/address'
import { Token } from '@uniswap/sdk-core'

import { useActiveWeb3React } from 'hooks/web3'
import { useAddOrUpdateOrders } from 'state/orders/hooks'
import { getOrders, OrderMetaData } from 'api/gnosisProtocol/api'
import { useAllTokens } from 'hooks/Tokens'
import { Order, OrderStatus } from 'state/orders/actions'
import { AMOUNT_OF_ORDERS_TO_FETCH, NATIVE_CURRENCY_BUY_ADDRESS, NATIVE_CURRENCY_BUY_TOKEN } from 'constants/index'
import { ChainId } from 'state/lists/actions'
import { ApiOrderStatus, classifyOrder } from 'state/orders/utils'
import { computeOrderSummary } from 'state/orders/updaters/utils'
import { useTokensLazy } from 'hooks/useTokensLazy'

function getTokenFromMapping(
  address: string,
  chainId: ChainId,
  tokens: { [p: string]: Token | null }
): Token | undefined | null {
  if (address.toLowerCase() === NATIVE_CURRENCY_BUY_ADDRESS.toLowerCase()) {
    return NATIVE_CURRENCY_BUY_TOKEN[chainId]
  }
  // Some tokens are checksummed, some are not. Search both ways
  return tokens[getAddress(address)] || tokens[address]
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
  allTokens: { [address: string]: Token | null }
): Order | undefined {
  const { uid: id, sellToken, buyToken, creationDate: creationTime, receiver } = order

  const inputToken = getTokenFromMapping(sellToken, chainId, allTokens)
  const outputToken = getTokenFromMapping(buyToken, chainId, allTokens)

  const apiStatus = classifyOrder(order)
  const status = statusMapping[apiStatus]

  if (!status) {
    console.warn(`ApiOrdersUpdater::Order ${id} in unknown internal state: ${apiStatus}`)
    return
  }
  if (!inputToken || !outputToken) {
    console.warn(
      `ApiOrdersUpdater::Tokens not found for order ${id}: sellToken ${!inputToken ? sellToken : 'found'} - buyToken ${
        !outputToken ? buyToken : 'found'
      }`
    )
    return
  }

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
}

export function ApiOrdersUpdater(): null {
  const { account, chainId } = useActiveWeb3React()
  const allTokens = useAllTokens()
  const tokensAreLoaded = useMemo(() => Object.keys(allTokens).length > 0, [allTokens])
  const addOrUpdateOrders = useAddOrUpdateOrders()
  const getTokensFromChain = useTokensLazy()

  // Using a ref to store allTokens to avoid re-fetching when new tokens are added
  // but still use the latest whenever the callback is invoked
  const allTokensRef = useRef(allTokens)
  // Updated on every change
  allTokensRef.current = allTokens

  const updateOrders = useCallback(
    async (chainId: ChainId, account: string): Promise<void> => {
      const tokens = allTokensRef.current
      console.log(
        `ApiOrdersUpdater:: updating orders. Network ${chainId}, account ${account}, loaded tokens count ${
          Object.keys(tokens).length
        }`
      )
      try {
        // Fetch latest orders from API
        const apiOrders = await getOrders(chainId, account, AMOUNT_OF_ORDERS_TO_FETCH)

        const tokensToFetch = new Set<string>()

        // Find out which tokens are not yet loaded in the UI
        apiOrders.forEach(({ sellToken, buyToken }) => {
          if (!getTokenFromMapping(sellToken, chainId, tokens)) tokensToFetch.add(sellToken)
          if (!getTokenFromMapping(buyToken, chainId, tokens)) tokensToFetch.add(buyToken)
        })

        let fetchedTokens

        if (tokensToFetch.size > 0) {
          // Fetch them from the chain, only if we have to
          fetchedTokens = await getTokensFromChain(Array.from(tokensToFetch))
        }

        // Merge fetched tokens with what's currently loaded
        const reallyAllTokens = fetchedTokens ? { ...tokens, ...fetchedTokens } : tokens

        // Build store order objects, for all orders which we found both input/output tokens
        // Don't add order for those we didn't
        const orders = apiOrders.reduce<Order[]>((acc, order) => {
          const storeOrder = transformApiOrderToStoreOrder(order, chainId, reallyAllTokens)
          if (storeOrder) {
            acc.push(storeOrder)
          }
          return acc
        }, [])

        // Add orders to redux state
        addOrUpdateOrders({ orders, chainId })
      } catch (e) {
        console.error(`ApiOrdersUpdater::Failed to fetch orders`, e)
      }
    },
    [addOrUpdateOrders, getTokensFromChain]
  )

  useEffect(() => {
    if (account && chainId && tokensAreLoaded) {
      updateOrders(chainId, account)
    }
  }, [account, chainId, tokensAreLoaded, updateOrders])

  return null
}
