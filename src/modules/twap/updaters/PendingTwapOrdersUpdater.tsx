import { useUpdateAtom } from 'jotai/utils'
import { useEffect } from 'react'

import ms from 'ms.macro'

import { useComposableCowContract } from 'modules/advancedOrders/hooks/useComposableCowContract'
import { useSafeAppsSdk } from 'modules/wallet/web3-react/hooks/useSafeAppsSdk'

import { useSafeApiKit } from 'api/gnosisSafe/hooks/useSafeApiKit'

import { fetchPendingTwapOrders } from '../services/fetchPendingTwapOrders'
import { twapOrdersListAtom } from '../state/twapOrdersListAtom'

const PENDING_TWAP_UPDATE_INTERVAL = ms`5s`

export function PendingTwapOrdersUpdater() {
  const safeAppsSdk = useSafeAppsSdk()
  const safeApiKit = useSafeApiKit()
  const composableCowContract = useComposableCowContract()
  const setTwapOrders = useUpdateAtom(twapOrdersListAtom)

  useEffect(() => {
    if (!safeApiKit || !safeAppsSdk || !composableCowContract) return

    const persistOrders = () => {
      fetchPendingTwapOrders(safeAppsSdk, safeApiKit, composableCowContract).then((orders) => {
        setTwapOrders(orders)
      })
    }

    const interval = setInterval(persistOrders, PENDING_TWAP_UPDATE_INTERVAL)

    persistOrders()

    return () => clearInterval(interval)
  }, [safeApiKit, safeAppsSdk, composableCowContract, setTwapOrders])

  return null
}
