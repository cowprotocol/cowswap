import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { CHAIN_INFO } from '@cowprotocol/common-const'
import { ALL_SUPPORTED_CHAIN_IDS, getAddressKey } from '@cowprotocol/cow-sdk'

import { Props as ExplorerLinkProps } from 'components/common/BlockExplorerLink'
import { useMultipleErc20 } from 'hooks/useErc20'
import {
  GetOrderApi,
  GetOrderResult,
  MultipleOrders,
  tryGetOrderOnAllNetworksAndEnvironments,
} from 'services/helpers/tryGetOrderOnAllNetworks'
import { SingleErc20State } from 'state/erc20'
import { useNetworkId } from 'state/network'
import { Network, UiError } from 'types'
import { transformOrder } from 'utils'

import { Order, getAccountOrders, getTxOrders } from 'api/operator'
import { GetTxOrdersParams, RawOrder } from 'api/operator/types'
import { updateWeb3Provider } from 'api/web3'

import { web3 } from '../explorer/api'
import { ORDERS_QUERY_INTERVAL } from '../explorer/const'

type FetchAccountOrdersOptions = {
  /** Bypass the in-memory page cache so the request actually reaches the API */
  skipCache?: boolean
  /** Keep the current orders on screen instead of falling back to the loading placeholder */
  isBackgroundUpdate?: boolean
}

type GetAccountOrdersResult = Result & {
  isThereNext: boolean
}

type GetTxOrdersResult = Result & {
  errorTxPresentInNetworkId: Network | null
}

type Result = {
  orders: Order[] | undefined
  error?: UiError
  isLoading: boolean
}

interface UseOrdersWithTokenInfo {
  orders: Order[] | undefined
  areErc20Loading: boolean
  setOrders: (value: Order[] | undefined) => void
  setMountNewOrders: (value: boolean) => void
  setErc20Addresses: (value: string[]) => void
}

export function getTxOrderOnEveryNetworkAndEnvironment(
  networkId: Network,
  txHash: string,
): Promise<GetOrderResult<MultipleOrders>> {
  const defaultParams: GetTxOrdersParams = { networkId, txHash }
  const getOrderApi: GetOrderApi<GetTxOrdersParams, MultipleOrders> = {
    api: (_defaultParams) => getTxOrders(_defaultParams).then((orders) => (orders.length ? orders : null)),
    defaultParams,
  }

  return tryGetOrderOnAllNetworksAndEnvironments(networkId, getOrderApi)
}

export function useGetAccountOrders(
  ownerAddress: string,
  limit = 1000,
  offset = 0,
  pageIndex?: number,
): GetAccountOrdersResult {
  const networkId = useNetworkId() || undefined
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<UiError>()
  const { orders, setOrders, setMountNewOrders, setErc20Addresses } = useOrdersWithTokenInfo(networkId)
  const [isThereNext, setIsThereNext] = useState(false)
  // Requests are not cancellable, so tag each one and let only the most recent one write to the state.
  // Switching owner, network or page, and polls slower than the interval, would otherwise let an
  // older response land on top of newer orders
  const latestRequestId = useRef(0)

  const fetchOrders = useCallback(
    async (network: Network, owner: string, options: FetchAccountOrdersOptions = {}): Promise<void> => {
      const { skipCache = false, isBackgroundUpdate = false } = options
      const requestId = ++latestRequestId.current
      const isStale = (): boolean => requestId !== latestRequestId.current

      // A background update must not swap the table for the loading placeholder
      if (!isBackgroundUpdate) {
        setIsLoading(true)
      }

      try {
        const { orders, hasNextPage } = await getAccountOrders({ networkId: network, owner, offset, limit, skipCache })

        if (isStale()) return

        setIsThereNext(hasNextPage)
        const newErc20Addresses = filterDuplicateErc20Addresses(orders)
        setErc20Addresses(newErc20Addresses)

        setOrders(orders.map((order) => transformOrder(order)))
        setMountNewOrders(true)
        setError(undefined)
      } catch (e) {
        const msg = `Failed to fetch orders`
        console.error(msg, e)

        if (isStale()) return

        setError({ message: msg, type: 'error' })
      } finally {
        // Whichever request is the most recent one owns the loading state, background or not:
        // a superseded request leaves it to the one that replaced it
        if (!isStale()) {
          setIsLoading(false)
        }
      }
    },
    [limit, offset, setErc20Addresses, setMountNewOrders, setOrders],
  )

  useEffect(() => {
    if (!networkId) {
      return
    }

    const isFirstPage = !pageIndex || pageIndex <= 1

    setIsThereNext(false)
    // The first page is the one new orders land on, always get it fresh from the API
    fetchOrders(networkId, ownerAddress, { skipCache: isFirstPage })

    if (!isFirstPage) return

    const intervalId: NodeJS.Timeout = setInterval(() => {
      fetchOrders(networkId, ownerAddress, { skipCache: true, isBackgroundUpdate: true })
    }, ORDERS_QUERY_INTERVAL)

    return (): void => {
      clearInterval(intervalId)
    }
  }, [fetchOrders, networkId, ownerAddress, pageIndex])

  return useMemo(() => ({ orders, error, isLoading, isThereNext }), [orders, error, isLoading, isThereNext])
}

export function useGetTxOrders(txHash: string): GetTxOrdersResult {
  const networkId = useNetworkId() || undefined
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<UiError>()
  const { orders, areErc20Loading, setOrders, setMountNewOrders, setErc20Addresses } = useOrdersWithTokenInfo(networkId)
  const [errorTxPresentInNetworkId, setErrorTxPresentInNetworkId] = useState<Network | null>(null)

  const fetchOrders = useCallback(
    async (network: Network, _txHash: string): Promise<void> => {
      setIsLoading(true)

      try {
        const { order: _orders, errorOrderPresentInNetworkId: errorTxPresentInNetworkIdRaw } =
          await getTxOrderOnEveryNetworkAndEnvironment(network, _txHash)
        const ordersFetched = _orders || []
        const newErc20Addresses = filterDuplicateErc20Addresses(ordersFetched)

        setErc20Addresses(newErc20Addresses)

        setOrders(ordersFetched.map((order) => transformOrder(order)))
        setMountNewOrders(true)
        setError(undefined)

        if (errorTxPresentInNetworkIdRaw) {
          console.log({ _orders, errorTxPresentInNetworkIdRaw })
          setErrorTxPresentInNetworkId(errorTxPresentInNetworkIdRaw)
        }
      } catch (e) {
        const msg = `Failed to fetch tx orders`
        console.error(msg, e)
        setError({ message: msg, type: 'error' })
      } finally {
        setIsLoading(false)
      }
    },
    [setErc20Addresses, setMountNewOrders, setOrders],
  )

  useEffect(() => {
    if (!networkId) {
      return
    }

    fetchOrders(networkId, txHash)
  }, [fetchOrders, networkId, txHash])

  return useMemo(
    () => ({ orders, error, isLoading: isLoading || areErc20Loading, errorTxPresentInNetworkId }),
    [orders, error, isLoading, areErc20Loading, errorTxPresentInNetworkId],
  )
}

export function useTxOrderExplorerLink(
  txHash: string,
  isZeroOrders: boolean,
): ExplorerLinkProps | Record<string, unknown> | undefined {
  const networkId = useNetworkId() || undefined
  const [explorerLink, setExplorerLink] = useState<ExplorerLinkProps | Record<string, unknown> | undefined>()

  useEffect(() => {
    if (!networkId || !isZeroOrders) return

    for (const network of ALL_SUPPORTED_CHAIN_IDS) {
      //update provider to find tx in network
      updateWeb3Provider(web3, network)
      web3.eth.getTransaction(txHash).then((tx) => {
        if (tx) {
          setExplorerLink({
            type: 'tx',
            networkId: network,
            identifier: txHash,
            showLogo: true,
            label: CHAIN_INFO[network]?.explorerTitle || 'Etherscan',
          })
        }
      })
      if (explorerLink) break
    }
    // reset provider
    updateWeb3Provider(web3, networkId)
  }, [explorerLink, isZeroOrders, networkId, txHash])

  return explorerLink
}

function filterDuplicateErc20Addresses(ordersFetched: RawOrder[]): string[] {
  return ordersFetched.reduce((accumulator: string[], element) => {
    const updateAccumulator = (tokenAddress: string): void => {
      if (accumulator.indexOf(tokenAddress) === -1) {
        accumulator.push(tokenAddress)
      }
    }
    updateAccumulator(element.buyToken)
    updateAccumulator(element.sellToken)

    return accumulator
  }, [])
}

function isObjectEmpty(object: Record<string, unknown>): boolean {
  for (const key in object) {
    if (key) return false
  }

  return true
}

function useOrdersWithTokenInfo(networkId: Network | undefined): UseOrdersWithTokenInfo {
  const [orders, setOrders] = useState<Order[] | undefined>()
  const [erc20Addresses, setErc20Addresses] = useState<string[]>([])
  const { value: valueErc20s, isLoading: areErc20Loading } = useMultipleErc20({ networkId, addresses: erc20Addresses })
  const [mountNewOrders, setMountNewOrders] = useState(false)
  // `valueErc20s` is emptied every time the addresses to resolve are reset, so keep what was
  // already resolved around. It lets a background refresh render its orders with token info
  // right away, instead of blanking the token columns until the effect below kicks in
  const resolvedErc20s = useRef<Record<string, SingleErc20State>>({})

  useEffect(() => {
    resolvedErc20s.current = {}
    setOrders(undefined)
    setMountNewOrders(false)
  }, [networkId])

  useEffect(() => {
    if (isObjectEmpty(valueErc20s)) {
      return
    }

    resolvedErc20s.current = { ...resolvedErc20s.current, ...valueErc20s }
  }, [valueErc20s])

  const updateOrders = useCallback((newOrders: Order[] | undefined): void => {
    setOrders(newOrders?.map((order) => withTokenInfo(order, resolvedErc20s.current)))
  }, [])

  useEffect(() => {
    if (!orders || areErc20Loading || isObjectEmpty(valueErc20s) || !mountNewOrders) {
      return
    }

    setOrders(orders.map((order) => withTokenInfo(order, valueErc20s)))
    setMountNewOrders(false)
    setErc20Addresses([])
  }, [valueErc20s, networkId, areErc20Loading, mountNewOrders, orders])

  return useMemo(
    () => ({ orders, areErc20Loading, setOrders: updateOrders, setMountNewOrders, setErc20Addresses }),
    [orders, areErc20Loading, updateOrders, setMountNewOrders, setErc20Addresses],
  )
}

function withTokenInfo(order: Order, erc20s: Record<string, SingleErc20State>): Order {
  order.buyToken = erc20s[getAddressKey(order.buyTokenAddress)] || order.buyToken
  order.sellToken = erc20s[getAddressKey(order.sellTokenAddress)] || order.sellToken

  return order
}
