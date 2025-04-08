import { useAtomValue } from 'jotai'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { ALL_SUPPORTED_CHAIN_IDS } from '@cowprotocol/cow-sdk'

import { Props as ExplorerLinkProps } from 'components/common/BlockExplorerLink'
import { selectedOrderStatusAtom } from 'explorer/components/OrdersTableWidget'
import { useMultipleErc20 } from 'hooks/useErc20'
import {
  GetOrderApi,
  GetOrderResult,
  MultipleOrders,
  tryGetOrderOnAllNetworksAndEnvironments,
} from 'services/helpers/tryGetOrderOnAllNetworks'
import { useNetworkId } from 'state/network'
import { Network, UiError } from 'types'
import { transformOrder } from 'utils'

import { Order, getTxOrders } from 'api/operator'
import { useFilteredUserOrders } from 'api/operator/accountOrderUtils'
import { GetTxOrdersParams, RawOrder } from 'api/operator/types'
import { updateWeb3Provider } from 'api/web3'

import { web3 } from '../explorer/api'

function isObjectEmpty(object: Record<string, unknown>): boolean {

  for (const key in object) {
    if (key) return false
  }

  return true
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

type Result = {
  orders: Order[] | undefined
  error?: UiError
  isLoading: boolean
}

type GetAccountOrdersResult = Result & {
  isThereNext: boolean
  totalCount?: number
}

type GetTxOrdersResult = Result & {
  errorTxPresentInNetworkId: Network | null
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
  txHash: string
): Promise<GetOrderResult<MultipleOrders>> {
  const defaultParams: GetTxOrdersParams = { networkId, txHash }
  const getOrderApi: GetOrderApi<GetTxOrdersParams, MultipleOrders> = {
    api: (_defaultParams) => getTxOrders(_defaultParams).then((orders) => (orders.length ? orders : null)),
    defaultParams,
  }

  return tryGetOrderOnAllNetworksAndEnvironments(networkId, getOrderApi)
}

function useOrdersWithTokenInfo(networkId: Network | undefined): UseOrdersWithTokenInfo {
  const [orders, setOrders] = useState<Order[] | undefined>()
  const [erc20Addresses, setErc20Addresses] = useState<string[]>([])
  const { value: valueErc20s, isLoading: areErc20Loading } = useMultipleErc20({ networkId, addresses: erc20Addresses })
  const [mountNewOrders, setMountNewOrders] = useState(false)

  useEffect(() => {
    setOrders(undefined)
    setMountNewOrders(false)
  }, [networkId])

  useEffect(() => {
    if (!orders || areErc20Loading || isObjectEmpty(valueErc20s) || !mountNewOrders) {
      return
    }

    const newOrders = orders.map((order) => {
      order.buyToken = valueErc20s[order.buyTokenAddress.toLowerCase()] || order.buyToken
      order.sellToken = valueErc20s[order.sellTokenAddress.toLowerCase()] || order.sellToken

      return order
    })

    setOrders(newOrders)
    setMountNewOrders(false)
    setErc20Addresses([])
  }, [valueErc20s, networkId, areErc20Loading, mountNewOrders, orders])

  return useMemo(() => ({ orders, areErc20Loading, setOrders, setMountNewOrders, setErc20Addresses }), [orders, areErc20Loading, setOrders, setMountNewOrders, setErc20Addresses])
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
    [setErc20Addresses, setMountNewOrders, setOrders]
  )

  useEffect(() => {
    if (!networkId) {
      return
    }

    fetchOrders(networkId, txHash)
  }, [fetchOrders, networkId, txHash])

  return useMemo(() => ({ orders, error, isLoading: isLoading || areErc20Loading, errorTxPresentInNetworkId }), [orders, error, isLoading, areErc20Loading, errorTxPresentInNetworkId])
}

export function useTxOrderExplorerLink(
  txHash: string,
  isZeroOrders: boolean
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
            label: network === Network.GNOSIS_CHAIN ? 'Gnosisscan' : 'Etherscan',
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

export function useGetAccountOrders(
  ownerAddress: string,
  limit = 1000,
  offset = 0,
  pageIndex?: number
): GetAccountOrdersResult {
  const networkId = useNetworkId() || undefined
  const orderStatus = useAtomValue(selectedOrderStatusAtom)
  const filter = useCallback((order: Order) => {
    if (orderStatus === '') return true
    return order.status === orderStatus
  }, [orderStatus])
  const orders = useFilteredUserOrders(networkId, ownerAddress, filter)
  const isThereNext = orders.length > limit + offset

  return { orders: orders?.slice(offset, offset + limit) || [], isLoading: false, isThereNext, totalCount: orders.length }
}
