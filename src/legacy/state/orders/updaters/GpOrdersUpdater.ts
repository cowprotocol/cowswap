import { useUpdateAtom } from 'jotai/utils'
import { useCallback, useEffect, useMemo, useRef } from 'react'

import { EnrichedOrder, EthflowData, OrderClass, SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { getAddress } from '@ethersproject/address'
import { Token } from '@uniswap/sdk-core'

import { NATIVE_CURRENCY_BUY_ADDRESS, NATIVE_CURRENCY_BUY_TOKEN } from 'legacy/constants'
import { useAllTokens } from 'legacy/hooks/Tokens'
import { useTokenLazy } from 'legacy/hooks/useTokenLazy'
import { Order, OrderStatus } from 'legacy/state/orders/actions'
import { useAddOrUpdateOrders, useClearOrdersStorage } from 'legacy/state/orders/hooks'
import { computeOrderSummary } from 'legacy/state/orders/updaters/utils'
import { classifyOrder, OrderTransitionStatus } from 'legacy/state/orders/utils'

import { apiOrdersAtom } from 'modules/orders/state/apiOrdersAtom'
import { useWalletInfo } from 'modules/wallet'

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

function _transformGpOrderToStoreOrder(
  order: EnrichedOrder,
  chainId: ChainId,
  allTokens: { [address: string]: Token | null }
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
    // TODO: for some reason executedSellAmountBeforeFees is zero for limit-orders
    sellAmountBeforeFee: order.class === OrderClass.LIMIT ? order.sellAmount : order.executedSellAmountBeforeFees,
    inputToken,
    outputToken,
    id,
    creationTime,
    summary: '',
    status,
    receiver: receiver || '',
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

  // The function to compute the summary needs the Order instance to exist already
  // That's why it's not used before and an empty string is set instead
  storeOrder.summary = computeOrderSummary({ orderFromStore: storeOrder, orderFromApi: order }) || ''

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
  allTokens: { [address: string]: Token | null }
): ReturnType<typeof _getTokenFromMapping> {
  return isEthFlow ? NATIVE_CURRENCY_BUY_TOKEN[chainId] : _getTokenFromMapping(sellToken, chainId, allTokens)
}

function _getMissingTokensAddresses(
  orders: EnrichedOrder[],
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

function _filterOrders(orders: EnrichedOrder[], tokens: Record<string, Token | null>, chainId: ChainId): Order[] {
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
  const clearOrderStorage = useClearOrdersStorage()

  const { account, chainId } = useWalletInfo()
  const allTokens = useAllTokens()
  const tokensAreLoaded = useMemo(() => Object.keys(allTokens).length > 0, [allTokens])
  const addOrUpdateOrders = useAddOrUpdateOrders()
  const getToken = useTokenLazy()
  const updateApiOrders = useUpdateAtom(apiOrdersAtom)
  const gpOrders = useGpOrders()

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
      } catch (e: any) {
        console.error(`GpOrdersUpdater::Failed to fetch orders`, e)
      }
    },
    [addOrUpdateOrders, gpOrders, getToken]
  )

  useEffect(() => {
    updateApiOrders(gpOrders)
  }, [gpOrders, updateApiOrders])

  useEffect(() => {
    if (account && chainId && tokensAreLoaded) {
      updateOrders(chainId, account)
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
