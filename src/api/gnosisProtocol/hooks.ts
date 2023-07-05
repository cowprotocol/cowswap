import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { EnrichedOrder } from '@cowprotocol/cow-sdk'

import useSWR from 'swr'

import { AMOUNT_OF_ORDERS_TO_FETCH } from 'legacy/constants'
import { isBarnBackendEnv } from 'legacy/utils/environments'
import { isTruthy } from 'legacy/utils/misc'
import { supportedChainId } from 'legacy/utils/supportedChainId'

import { emulatedPartOrdersAtom } from 'modules/twap/state/emulatedPartOrdersAtom'
import { emulatedTwapOrdersAtom } from 'modules/twap/state/twapOrdersListAtom'
import { TwapPartOrderItem, twapPartOrdersListAtom } from 'modules/twap/state/twapPartOrdersAtom'
import { useWalletInfo } from 'modules/wallet'

import { OrderWithComposableCowInfo } from 'common/types'

import { getOrders } from './api'

type TwapPartOrdersMap = { [twapOrderHash: string]: TwapPartOrderItem }

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
  const { chainId: _chainId } = useWalletInfo()
  const chainId = supportedChainId(_chainId)
  const emulatedTwapOrders = useAtomValue(emulatedTwapOrdersAtom)
  const twapParticleOrders = useAtomValue(twapPartOrdersListAtom)

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

  const twapPartOrdersMap: TwapPartOrdersMap = useMemo(() => {
    return twapParticleOrders.reduce<TwapPartOrdersMap>((acc, val) => {
      acc[val.uid] = val

      return acc
    }, {})
  }, [twapParticleOrders])

  const twapChildOrders = useTwapChildOrders(prodOrders, twapPartOrdersMap)

  const regularOrders: OrderWithComposableCowInfo[] = useMemo(() => {
    if (!currentEnvOrders) return []

    return currentEnvOrders.filter((order) => !twapPartOrdersMap[order.uid]).map((order) => ({ order }))
  }, [currentEnvOrders, twapPartOrdersMap])

  return useMemo(() => {
    return [...regularOrders, ...emulatedTwapOrders, ...twapChildOrders]
  }, [regularOrders, emulatedTwapOrders, twapChildOrders])
}

// Take only orders are connected to TWAP orders
function useTwapChildOrders(
  prodOrders: EnrichedOrder[] | undefined,
  twapPartOrdersMap: TwapPartOrdersMap
): OrderWithComposableCowInfo[] {
  const emulatedPartOrders = useAtomValue(emulatedPartOrdersAtom)

  const filteredEmulatedPartOrders = useMemo(() => {
    const prodOrdersMap = (prodOrders || []).reduce<{ [key: string]: true }>((acc, val) => {
      acc[val.uid] = true
      return acc
    }, {})

    return emulatedPartOrders.filter((order) => !prodOrdersMap[order.order.uid])
  }, [emulatedPartOrders, prodOrders])

  const partOrdersFromProd = useMemo(() => {
    if (!prodOrders) return []

    const orderWithComposableCowInfo: OrderWithComposableCowInfo[] = prodOrders
      .map((order) => {
        const particleOrder = twapPartOrdersMap[order.uid]

        if (!particleOrder) return null

        return {
          order,
          composableCowInfo: {
            parentId: particleOrder.twapOrderId,
          },
        } as OrderWithComposableCowInfo
      })
      .filter(isTruthy)

    return orderWithComposableCowInfo
  }, [prodOrders, twapPartOrdersMap])

  return useMemo(() => {
    return [...partOrdersFromProd, ...filteredEmulatedPartOrders]
  }, [partOrdersFromProd, filteredEmulatedPartOrders])
}
