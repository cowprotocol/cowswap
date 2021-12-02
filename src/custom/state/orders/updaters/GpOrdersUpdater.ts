import { useCallback, useEffect, useMemo, useRef } from 'react'

import { getAddress } from '@ethersproject/address'
import { Token } from '@uniswap/sdk-core'

import { useActiveWeb3React } from 'hooks/web3'
import { useAddOrUpdateOrders } from 'state/orders/hooks'
import { OrderMetaData } from 'api/gnosisProtocol/api'
import { useAllTokens } from 'hooks/Tokens'
import { Order, OrderStatus } from 'state/orders/actions'
import { GP_ORDER_UPDATE_INTERVAL, NATIVE_CURRENCY_BUY_ADDRESS, NATIVE_CURRENCY_BUY_TOKEN } from 'constants/index'
import { ChainId } from 'state/lists/actions'
import { classifyOrder, OrderTransitionStatus } from 'state/orders/utils'
import { computeOrderSummary } from 'state/orders/updaters/utils'
import { useTokenLazy } from 'hooks/useTokenLazy'
import { useGpOrders } from 'api/gnosisProtocol/hooks'

function _getTokenFromMapping(
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

const statusMapping: Record<OrderTransitionStatus, OrderStatus | undefined> = {
  cancelled: OrderStatus.CANCELLED,
  expired: OrderStatus.EXPIRED,
  fulfilled: OrderStatus.FULFILLED,
  presignaturePending: OrderStatus.PRESIGNATURE_PENDING,
  pending: OrderStatus.PENDING,
  presigned: OrderStatus.PENDING, // presigned is still pending
  unknown: undefined,
}

function _transformGpOrderToStoreOrder(
  order: OrderMetaData,
  chainId: ChainId,
  allTokens: { [address: string]: Token | null }
): Order | undefined {
  const { uid: id, sellToken, buyToken, creationDate: creationTime, receiver } = order

  const inputToken = _getTokenFromMapping(sellToken, chainId, allTokens)
  const outputToken = _getTokenFromMapping(buyToken, chainId, allTokens)

  const apiStatus = classifyOrder(order)
  const status = statusMapping[apiStatus]

  if (!status) {
    console.warn(`GpOrdersUpdater::Order ${id} in unknown internal state: ${apiStatus}`)
    return
  }
  if (!inputToken || !outputToken) {
    console.warn(
      `GpOrdersUpdater::Tokens not found for order ${id}: sellToken ${!inputToken ? sellToken : 'found'} - buyToken ${
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

function _getMissingTokensAddresses(
  orders: OrderMetaData[],
  tokens: Record<string, Token>,
  chainId: ChainId
): string[] {
  const tokensToFetch = new Set<string>()

  // Find out which tokens are not yet loaded in the UI
  orders.forEach(({ sellToken, buyToken }) => {
    if (!_getTokenFromMapping(sellToken, chainId, tokens)) tokensToFetch.add(sellToken)
    if (!_getTokenFromMapping(buyToken, chainId, tokens)) tokensToFetch.add(buyToken)
  })

  return Array.from(tokensToFetch)
}

async function _fetchTokens(
  tokensToFetch: string[],
  getToken: (address: string) => Promise<Token | null>
): Promise<Record<string, Token | null>> {
  if (tokensToFetch.length === 0) {
    return {}
  }

  const promises = tokensToFetch.map((address) => getToken(address))
  const settledPromises = await Promise.allSettled(promises)

  return settledPromises.reduce<Record<string, Token | null>>((acc, promiseResult) => {
    if (promiseResult.status === 'fulfilled' && promiseResult.value) {
      acc[promiseResult.value.address] = promiseResult.value
    }
    return acc
  }, {})
}

function _filterOrders(orders: OrderMetaData[], tokens: Record<string, Token | null>, chainId: ChainId): Order[] {
  return orders.reduce<Order[]>((acc, order) => {
    const storeOrder = _transformGpOrderToStoreOrder(order, chainId, tokens)
    if (storeOrder) {
      acc.push(storeOrder)
    }
    return acc
  }, [])
}

/**
 * Updater for GP orders
 *
 * This updater fetches orders from GnosisProtocol backend API instead of onchain (since we work with offline orders)
 * It will:
 * - Fetch the most recent orders (up to ~100), once, on every account/chainId change
 * - Transform them from `OrderMetaData` into the local order representation type `Order`
 * - Identify and try to load tokens present in the orders but not in the local list of tokens
 * - Ignore orders for which a token could not be found
 * - Persist the new tokens and orders on redux
 */
export function GpOrdersUpdater(): null {
  const { account, chainId } = useActiveWeb3React()
  const allTokens = useAllTokens()
  const tokensAreLoaded = useMemo(() => Object.keys(allTokens).length > 0, [allTokens])
  const addOrUpdateOrders = useAddOrUpdateOrders()
  const getToken = useTokenLazy()
  const gpOrders = useGpOrders(account, GP_ORDER_UPDATE_INTERVAL)

  // Using a ref to store allTokens to avoid re-fetching when new tokens are added
  // but still use the latest whenever the callback is invoked
  const allTokensRef = useRef(allTokens)
  // Updated on every change
  allTokensRef.current = allTokens

  const updateOrders = useCallback(
    async (chainId: ChainId, account: string): Promise<void> => {
      const tokens = allTokensRef.current
      console.debug(
        `GpOrdersUpdater:: updating orders. Network ${chainId}, account ${account}, loaded tokens count ${
          Object.keys(tokens).length
        }`
      )
      try {
        if (!gpOrders?.length) {
          return
        }

        const tokensToFetch = _getMissingTokensAddresses(gpOrders, tokens, chainId)
        console.debug(`GpOrdersUpdater::will try to fetch ${tokensToFetch.length} tokens`)

        // Fetch them from the chain
        const fetchedTokens = await _fetchTokens(tokensToFetch, getToken)
        console.debug(
          `GpOrdersUpdater::fetched ${Object.keys(fetchedTokens).filter(Boolean).length} out of ${
            tokensToFetch.length
          } tokens`
        )

        // Merge fetched tokens with what's currently loaded
        const reallyAllTokens = { ...tokens, ...fetchedTokens }

        // Build store order objects, for all orders which we found both input/output tokens
        // Don't add order for those we didn't
        const orders = _filterOrders(gpOrders, reallyAllTokens, chainId)
        console.debug(`GpOrdersUpdater::will add/update ${orders.length} out of ${gpOrders.length}`)

        // Add orders to redux state
        orders.length && addOrUpdateOrders({ orders, chainId })
      } catch (e) {
        console.error(`GpOrdersUpdater::Failed to fetch orders`, e)
      }
    },
    [addOrUpdateOrders, gpOrders, getToken]
  )

  useEffect(() => {
    if (account && chainId && tokensAreLoaded) {
      updateOrders(chainId, account)
    }
  }, [account, chainId, tokensAreLoaded, updateOrders])

  return null
}
