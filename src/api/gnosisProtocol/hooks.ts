import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { EnrichedOrder } from '@cowprotocol/cow-sdk'

import useSWR from 'swr'

import { AMOUNT_OF_ORDERS_TO_FETCH } from 'legacy/constants'
import { isBarnBackendEnv } from 'legacy/utils/environments'

import { emulatedPartOrdersAtom } from 'modules/twap/state/emulatedPartOrdersAtom'
import { twapPartOrdersAtom } from 'modules/twap/state/twapPartOrdersAtom'
import { useWalletInfo } from 'modules/wallet'

import { OrderWithComposableCowInfo } from 'common/types'

import { getOrders } from './api'

/**
 * TODO: refactor this hook
 * Currently there is a problem with Dependency inversion principle
 * This hook depends on 'modules/twap', but it must not
 *
 * This violation is added because of environment restrictions for TWAP
 * Currently, WatchTower creates discrete orders only on PROD environment
 * And even if you created a TWAP order not in PROD, we have to load discrete orders from PROD order-book
 *
 * For non-PROD environment we do two requests: barn and prod
 * For PROD environment we do only one: prod. It depends on isBarnBackendEnv
 */
export function useGpOrders(account?: string | null, refreshInterval?: number): OrderWithComposableCowInfo[] {
  const { chainId } = useWalletInfo()
  const twapPartOrders = useAtomValue(twapPartOrdersAtom)

  const requestParams = useMemo(() => {
    return account ? { owner: account, limit: AMOUNT_OF_ORDERS_TO_FETCH } : null
  }, [account])

  // Fetch orders for the current environment
  const { data: currentEnvOrders } = useSWR<EnrichedOrder[]>(
    ['orders', requestParams, chainId],
    () => {
      if (!chainId || !requestParams) return []

      return getOrders(requestParams, { chainId })
    },
    { refreshInterval }
  )

  // Fetch PROD orders only when current env is not prod
  // We need them for TWAP
  const { data: loadedProdOrders } = useSWR<EnrichedOrder[]>(
    ['prod-orders', requestParams, chainId],
    () => {
      if (!chainId || !requestParams) return []
      if (!isBarnBackendEnv) return []

      return getOrders(requestParams, { chainId, env: 'prod' })
    },
    { refreshInterval }
  )

  const prodOrders = useMemo(() => {
    return isBarnBackendEnv ? loadedProdOrders : currentEnvOrders
  }, [currentEnvOrders, loadedProdOrders])

  const twapChildOrders = useTwapChildOrders(prodOrders)

  const regularOrders: OrderWithComposableCowInfo[] = useMemo(() => {
    if (!currentEnvOrders) return []

    return currentEnvOrders.filter((order) => !twapPartOrders[order.uid]).map((order) => ({ order }))
  }, [currentEnvOrders, twapPartOrders])

  return useMemo(() => {
    return [...regularOrders, ...twapChildOrders]
  }, [regularOrders, twapChildOrders])
}

interface TwapChildOrders {
  discreteOrders: { order: OrderWithComposableCowInfo; orderFromProd: EnrichedOrder }[]
  virtualOrders: OrderWithComposableCowInfo[]
}
// Take only orders are connected to TWAP orders
function useTwapChildOrders(prodOrders: EnrichedOrder[] | undefined): OrderWithComposableCowInfo[] {
  const emulatedPartOrders = useAtomValue(emulatedPartOrdersAtom)

  const { discreteOrders, virtualOrders } = useMemo(() => {
    const prodOrdersMap = (prodOrders || []).reduce<{ [key: string]: EnrichedOrder }>((acc, val) => {
      acc[val.uid] = val
      return acc
    }, {})

    return emulatedPartOrders.reduce<TwapChildOrders>(
      (acc, order) => {
        const orderFromProd = prodOrdersMap[order.order.uid]

        if (orderFromProd) {
          acc.discreteOrders.push({ order, orderFromProd })
        } else {
          acc.virtualOrders.push(order)
        }

        return acc
      },
      { discreteOrders: [], virtualOrders: [] }
    )
  }, [emulatedPartOrders, prodOrders])

  const partOrdersFromProd = useMemo(() => {
    return discreteOrders.map(({ order: { order, composableCowInfo }, orderFromProd }) => {
      return {
        order: {
          ...orderFromProd,
          status: order.status,
        },
        composableCowInfo: {
          id: composableCowInfo?.id,
          parentId: composableCowInfo?.parentId,
          isCancelling: composableCowInfo?.isCancelling,
        },
      } as OrderWithComposableCowInfo
    })
  }, [discreteOrders])

  return useMemo(() => {
    return [...partOrdersFromProd, ...virtualOrders]
  }, [partOrdersFromProd, virtualOrders])
}
