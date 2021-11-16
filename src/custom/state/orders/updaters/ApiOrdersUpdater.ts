import { useCallback, useEffect, useMemo, useRef } from 'react'

import { getAddress } from '@ethersproject/address'
import { Token } from '@uniswap/sdk-core'

import { useActiveWeb3React } from 'hooks/web3'
import { useAddOrUpdateOrders } from 'state/orders/hooks'
import { getOrders, OrderMetaData } from 'api/gnosisProtocol/api'
import { useAllTokens } from 'hooks/Tokens'
import { Order, OrderStatus } from 'state/orders/actions'
import { AMOUNT_OF_ORDERS_TO_FETCH, NATIVE_CURRENCY_BUY_ADDRESS, NATIVE_CURRENCY_BUY_TOKEN } from 'constants/index'
import { ChainId } from 'state/lists/actions'
import { classifyOrder, OrderTransitionStatus } from 'state/orders/utils'
import { computeOrderSummary } from 'state/orders/updaters/utils'
import { TokenGetter, useTokenLazy } from 'hooks/useTokenLazy'
import { RetryResult, WithCancel } from 'custom/types'

const NO_TOKENS = { promise: Promise.resolve({}), cancel: () => {} } // eslint-disable-line

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

const statusMapping: Record<OrderTransitionStatus, OrderStatus | undefined> = {
  cancelled: OrderStatus.CANCELLED,
  expired: OrderStatus.EXPIRED,
  fulfilled: OrderStatus.FULFILLED,
  presignaturePending: OrderStatus.PRESIGNATURE_PENDING,
  pending: OrderStatus.PENDING,
  presigned: OrderStatus.PENDING, // presigned is still pending
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

function getMissingTokensAddresses(orders: OrderMetaData[], tokens: Record<string, Token>, chainId: ChainId): string[] {
  const tokensToFetch = new Set<string>()

  // Find out which tokens are not yet loaded in the UI
  orders.forEach(({ sellToken, buyToken }) => {
    if (!getTokenFromMapping(sellToken, chainId, tokens)) tokensToFetch.add(sellToken)
    if (!getTokenFromMapping(buyToken, chainId, tokens)) tokensToFetch.add(buyToken)
  })

  return Array.from(tokensToFetch)
}

function fetchTokens(tokensToFetch: string[], getToken: TokenGetter): RetryResult<Record<string, Token | null>> {
  if (tokensToFetch.length === 0) {
    return NO_TOKENS
  }

  const getTokenResult = tokensToFetch.map((address) => getToken(address))
  const { cancellations, promises } = getTokenResult.reduce(
    (acc, result) => {
      const { cancel, promise } = result
      acc.promises.push(promise)
      acc.cancellations.push(cancel)

      return acc
    },
    { cancellations: [] as WithCancel['cancel'][], promises: [] as Promise<Token | null>[] }
  )

  // Resolve all promises
  const promise = Promise.allSettled(promises).then((settledPromises) => {
    return settledPromises.reduce<Record<string, Token | null>>((acc, promiseResult) => {
      if (promiseResult.status === 'fulfilled' && promiseResult.value) {
        acc[promiseResult.value.address] = promiseResult.value
      }
      return acc
    }, {})
  })

  // Cancel promises
  const cancel = () => cancellations.forEach((cancel) => cancel())

  return { cancel, promise }
}

function filterOrders(orders: OrderMetaData[], tokens: Record<string, Token | null>, chainId: ChainId): Order[] {
  return orders.reduce<Order[]>((acc, order) => {
    const storeOrder = transformApiOrderToStoreOrder(order, chainId, tokens)
    if (storeOrder) {
      acc.push(storeOrder)
    }
    return acc
  }, [])
}

export function ApiOrdersUpdater(): null {
  const { account, chainId } = useActiveWeb3React()
  const allTokens = useAllTokens()
  const tokensAreLoaded = useMemo(() => Object.keys(allTokens).length > 0, [allTokens])
  const addOrUpdateOrders = useAddOrUpdateOrders()
  const getToken = useTokenLazy()

  // Using a ref to store allTokens to avoid re-fetching when new tokens are added
  // but still use the latest whenever the callback is invoked
  const allTokensRef = useRef(allTokens)
  // Updated on every change
  allTokensRef.current = allTokens

  const updateOrders = useCallback(
    (chainId: ChainId, account: string): Promise<void> => {
      const tokens = allTokensRef.current
      console.log(
        `ApiOrdersUpdater:: updating orders. Network ${chainId}, account ${account}, loaded tokens count ${
          Object.keys(tokens).length
        }`
      )

      // Fetch latest orders from API
      let cancel: () => void | undefined
      getOrders(chainId, account, AMOUNT_OF_ORDERS_TO_FETCH)
        .then((apiOrders) => {
          if (apiOrders.length === 0) {
            return
          }

          const tokensToFetch = getMissingTokensAddresses(apiOrders, tokens, chainId)

          // Fetch them from the chain
          const { promise: fetchedTokensPromise, cancel: cancelTokenPromise } = fetchTokens(tokensToFetch, getToken)
          cancel = cancelTokenPromise

          fetchedTokensPromise.then((fetchedTokens) => {
            // Merge fetched tokens with what's currently loaded
            const reallyAllTokens = { ...tokens, ...fetchedTokens }

            // Build store order objects, for all orders which we found both input/output tokens
            // Don't add order for those we didn't
            const orders = filterOrders(apiOrders, reallyAllTokens, chainId)

            // Add orders to redux state
            orders.length && addOrUpdateOrders({ orders, chainId })
          })
        })
        .catch((e) => {
          console.error(`ApiOrdersUpdater::Failed to fetch orders`, e)
        })

      return () => cancel && cancel()
    },
    [addOrUpdateOrders, getToken]
  )

  useEffect(() => {
    if (account && chainId && tokensAreLoaded) {
      const cancel = updateOrders(chainId, account)
      return cancel
    }
  }, [account, chainId, tokensAreLoaded, updateOrders])

  return null
}
