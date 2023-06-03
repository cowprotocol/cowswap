import { useUpdateAtom } from 'jotai/utils'
import { useEffect } from 'react'

import ms from 'ms.macro'

import { useComposableCowContract } from 'modules/advancedOrders/hooks/useComposableCowContract'
import { useSafeAppsSdk } from 'modules/wallet/web3-react/hooks/useSafeAppsSdk'

import { useSafeApiKit } from 'api/gnosisSafe/hooks/useSafeApiKit'

import { fetchPendingTwapOrders } from '../services/fetchPendingTwapOrders'
import { addTwapOrdersInListAtom } from '../state/twapOrdersListAtom'

const PENDING_TWAP_UPDATE_INTERVAL = ms`5s`

export function PendingTwapOrdersUpdater() {
  const safeAppsSdk = useSafeAppsSdk()
  const safeApiKit = useSafeApiKit()
  const composableCowContract = useComposableCowContract()
  const addTwapOrders = useUpdateAtom(addTwapOrdersInListAtom)

  useEffect(() => {
    if (!safeApiKit || !safeAppsSdk || !composableCowContract) return

    const persistOrders = () => {
      fetchPendingTwapOrders(safeAppsSdk, safeApiKit, composableCowContract).then((orders) => {
        addTwapOrders(orders)
      })
    }

    const interval = setInterval(persistOrders, PENDING_TWAP_UPDATE_INTERVAL)

    persistOrders()

    return () => clearInterval(interval)
  }, [safeApiKit, safeAppsSdk, composableCowContract, addTwapOrders])

  return null
}
