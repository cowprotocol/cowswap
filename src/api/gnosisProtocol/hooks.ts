import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { EnrichedOrder } from '@cowprotocol/cow-sdk'

import useSWR from 'swr'

import { AMOUNT_OF_ORDERS_TO_FETCH } from 'legacy/constants'
import { isBarnBackendEnv } from 'legacy/utils/environments'
import { isTruthy } from 'legacy/utils/misc'
import { supportedChainId } from 'legacy/utils/supportedChainId'

import { emulatedTwapOrdersAtom } from 'modules/twap/state/twapOrdersListAtom'
import { TwapPartOrderItem, twapPartOrdersListAtom } from 'modules/twap/state/twapPartOrdersAtom'
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
  const { chainId: _chainId } = useWalletInfo()
  const chainId = supportedChainId(_chainId)
  const emulatedTwapOrders = useAtomValue(emulatedTwapOrdersAtom)

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

    return currentEnvOrders.map((order) => ({ order }))
  }, [currentEnvOrders])

  return useMemo(() => {
    return [...regularOrders, ...emulatedTwapOrders, ...twapChildOrders]
  }, [regularOrders, emulatedTwapOrders, twapChildOrders])
}

// Take only orders are connected to TWAP orders
function useTwapChildOrders(prodOrders: EnrichedOrder[] | undefined): OrderWithComposableCowInfo[] {
  const twapParticleOrders = useAtomValue(twapPartOrdersListAtom)

  return useMemo(() => {
    if (!prodOrders) return []

    const particleOrdersMap = twapParticleOrders.reduce<{ [uid: string]: TwapPartOrderItem }>((acc, val) => {
      acc[val.uid] = val

      return acc
    }, {})

    const orderWithComposableCowInfo: OrderWithComposableCowInfo[] = prodOrders
      .map((order) => {
        const particleOrder = particleOrdersMap[order.uid]

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
  }, [twapParticleOrders, prodOrders])
}
