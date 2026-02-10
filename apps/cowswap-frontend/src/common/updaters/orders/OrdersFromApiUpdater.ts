/* eslint-disable @typescript-eslint/no-restricted-imports */ // TODO: Don't use 'modules' import
import { useSetAtom } from 'jotai'
import { useCallback, useEffect, useMemo, useRef } from 'react'

import { NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { EnrichedOrder, EthflowData, OrderClass, SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { TokensByAddress, useAllActiveTokens } from '@cowprotocol/tokens'
import { useIsSafeWallet, useWalletInfo } from '@cowprotocol/wallet'

import { Order, OrderStatus } from 'legacy/state/orders/actions'
import { useAddOrUpdateOrders, useClearOrdersStorage } from 'legacy/state/orders/hooks'
import { classifyOrder, OrderTransitionStatus } from 'legacy/state/orders/utils'

import { getTokensListFromOrders, useTokensForOrdersList } from 'modules/orders'
import { apiOrdersAtom } from 'modules/orders/state/apiOrdersAtom'
import { ordersFromApiStatusAtom } from 'modules/orders/state/ordersFromApiStatusAtom'

import { useOrdersFromOrderBook } from 'api/cowProtocol/hooks'
import { getTokenFromMapping } from 'utils/orderUtils/getTokenFromMapping'

// TODO: update this for ethflow states
const statusMapping: Record<OrderTransitionStatus, OrderStatus | undefined> = {
  cancelled: OrderStatus.CANCELLED,
  expired: OrderStatus.EXPIRED,
  fulfilled: OrderStatus.FULFILLED,
  presignaturePending: OrderStatus.PRESIGNATURE_PENDING,
  pending: OrderStatus.PENDING,
  presigned: OrderStatus.PENDING, // presigned is still pending
  unknown: undefined,
}

// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line complexity
function _transformOrderBookOrderToStoreOrder(
  order: EnrichedOrder,
  chainId: ChainId,
  allTokens: TokensByAddress,
): Order | undefined {
  const {
    uid: id,
    sellToken,
    buyToken,
    creationDate: creationTime,
    receiver,
    ethflowData: ethflowDataRaw,
    owner,
    onchainOrderData,
  } = order
  // Hack, because Swagger doesn't have isRefunded property and backend is going to delete it soon
  const ethflowData: (EthflowData & { isRefunded?: boolean }) | undefined = ethflowDataRaw

  const isEthFlow = Boolean(ethflowData)

  const inputToken = _getInputToken(isEthFlow, chainId, sellToken, allTokens)
  const outputToken = getTokenFromMapping(buyToken, chainId, allTokens)

  const apiStatus = classifyOrder(order)
  const status = statusMapping[apiStatus]

  if (!status) {
    console.warn(`OrdersFromApiUpdater::Order ${id} in unknown internal state: ${apiStatus}`)
    return
  }
  if (!inputToken || !outputToken) {
    console.warn(
      `OrdersFromApiUpdater::Tokens not found for order ${id}: sellToken ${
        !inputToken ? sellToken : 'found'
      } - buyToken ${!outputToken ? buyToken : 'found'}`,
    )
    return
  }

  const storeOrder: Order = {
    ...order,
    // TODO: for some reason executedSellAmountBeforeFees is zero for limit-orders
    sellAmountBeforeFee: order.class === OrderClass.LIMIT ? order.sellAmount : order.executedSellAmountBeforeFees,
    inputToken,
    outputToken,
    id,
    creationTime,
    status,
    receiver: receiver || '',
    fullAppData: order.fullAppData,
    apiAdditionalInfo: order,
    isCancelling: apiStatus === 'pending' && order.invalidated, // already cancelled in the API, not yet in the UI
    // EthFlow related
    owner: onchainOrderData?.sender || owner,
    validTo: ethflowData?.userValidTo || order.validTo,
    isRefunded: ethflowData?.isRefunded, // TODO: this will be removed from the API
    refundHash: ethflowData?.refundTxHash || undefined,
    buyTokenBalance: order.buyTokenBalance,
    sellTokenBalance: order.sellTokenBalance,
  }

  // EthFlow adjustments
  // It can happen that EthFlow cancellation is identified in the app before the API is aware
  // In that case
  if (order.ethflowData && order.status === 'cancelled') {
    storeOrder.status = OrderStatus.CANCELLED
    storeOrder.isCancelling = false
  }

  return storeOrder
}

function _getInputToken(
  isEthFlow: boolean,
  chainId: ChainId,
  sellToken: string,
  allTokens: TokensByAddress,
): ReturnType<typeof getTokenFromMapping> {
  return isEthFlow ? NATIVE_CURRENCIES[chainId] : getTokenFromMapping(sellToken, chainId, allTokens)
}

function _filterOrders(orders: EnrichedOrder[], tokens: TokensByAddress, chainId: ChainId): Order[] {
  return orders.reduce<Order[]>((acc, order) => {
    const storeOrder = _transformOrderBookOrderToStoreOrder(order, chainId, tokens)
    if (storeOrder) {
      acc.push(storeOrder)
    }
    return acc
  }, [])
}

/**
 * Updater for orders
 *
 * This updater fetches orders from CoWProtocol backend API instead of onchain (since we work with offline orders)
 * It will:
 * - Fetch the most recent orders (up to ~100), once, on every account/chainId change
 * - Transform them from `OrderMetaData` into the local order representation type `Order`
 * - Identify and try to load tokens present in the orders but not in the local list of tokens
 * - Ignore orders for which a token could not be found
 * - Persist the new tokens and orders on redux
 */
export function OrdersFromApiUpdater(): null {
  const isSafeWallet = useIsSafeWallet()
  const clearOrderStorage = useClearOrdersStorage()

  const { account, chainId } = useWalletInfo()
  const allTokens = useAllActiveTokens().tokens
  const tokensAreLoaded = useMemo(() => Object.keys(allTokens).length > 0, [allTokens])
  const addOrUpdateOrders = useAddOrUpdateOrders()
  const updateApiOrders = useSetAtom(apiOrdersAtom)
  const updateOrdersStatus = useSetAtom(ordersFromApiStatusAtom)
  const ordersFromOrderBook = useOrdersFromOrderBook()
  const getTokensForOrdersList = useTokensForOrdersList()

  // Using a ref to store allTokens to avoid re-fetching when new tokens are added
  // but still use the latest whenever the callback is invoked
  const allTokensRef = useRef(allTokens)
  // Updated on every change
  // eslint-disable-next-line react-hooks/refs
  allTokensRef.current = allTokens

  const updateOrders = useCallback(
    async (chainId: ChainId): Promise<void> => {
      try {
        if (!ordersFromOrderBook.orders.length) {
          return
        }

        const tokensToFetch = getTokensListFromOrders(ordersFromOrderBook.orders)
        // Merge fetched tokens with what's currently loaded
        const reallyAllTokens = await getTokensForOrdersList(tokensToFetch)

        // Build store order objects, for all orders which we found both input/output tokens
        // Don't add order for those we didn't
        const orders = _filterOrders(ordersFromOrderBook.orders, reallyAllTokens, chainId)
        console.debug(
          `OrdersFromApiUpdater::will add/update ${orders.length} out of ${ordersFromOrderBook.orders.length}`,
        )

        // Add orders to redux state
        orders.length && addOrUpdateOrders({ orders, chainId, isSafeWallet })
        // TODO: Replace any with proper type definitions
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        console.error(`OrdersFromApiUpdater::Failed to fetch orders`, e)
      }
    },
    [addOrUpdateOrders, ordersFromOrderBook, getTokensForOrdersList, isSafeWallet],
  )

  useEffect(() => {
    updateApiOrders(ordersFromOrderBook.orders)
  }, [ordersFromOrderBook.orders, updateApiOrders])

  useEffect(() => {
    if (!ordersFromOrderBook.isEnabled) {
      updateOrdersStatus('idle')
      return
    }

    if (ordersFromOrderBook.isLoading) {
      updateOrdersStatus('loading')
      return
    }

    if (ordersFromOrderBook.error) {
      updateOrdersStatus('error')
      return
    }

    updateOrdersStatus('success')
  }, [ordersFromOrderBook.error, ordersFromOrderBook.isEnabled, ordersFromOrderBook.isLoading, updateOrdersStatus])

  useEffect(() => {
    if (account && chainId && tokensAreLoaded) {
      updateOrders(chainId)
    }
  }, [account, chainId, tokensAreLoaded, updateOrders])

  useEffect(() => {
    clearOrderStorage()

    return function () {
      clearOrderStorage()
    }
  }, [clearOrderStorage])

  return null
}
