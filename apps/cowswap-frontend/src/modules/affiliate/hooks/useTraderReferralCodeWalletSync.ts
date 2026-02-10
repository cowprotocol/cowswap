import { useAtomValue } from 'jotai'
import { useEffect, useLayoutEffect, useMemo, useState } from 'react'

import { SupportedChainId, areAddressesEqual } from '@cowprotocol/cow-sdk'

import { useSelector } from 'react-redux'

import { AppState } from 'legacy/state'
import { flatOrdersStateNetwork } from 'legacy/state/orders/flatOrdersStateNetwork'
import { getDefaultNetworkState, OrdersState } from 'legacy/state/orders/reducer'

import { AFFILIATE_ELIGIBILITY_LOADING_WARNING_MS } from 'modules/affiliate/config/affiliateProgram.const'
import { ordersFromApiStatusAtom } from 'modules/orders/state/ordersFromApiStatusAtom'

import { TraderReferralCodeContextValue } from '../lib/affiliateProgramTypes'

interface WalletSyncParams {
  account?: string
  chainId?: number
  supportedNetwork: boolean
  actions: TraderReferralCodeContextValue['actions']
  savedCode?: string
}

export function useTraderReferralCodeWalletSync(params: WalletSyncParams): void {
  const { account, chainId, supportedNetwork, actions, savedCode } = params
  const ordersState = useSelector<AppState, OrdersState | undefined>((state) => state.orders)
  const ordersFromApiStatus = useAtomValue(ordersFromApiStatusAtom)
  const [hasLoadingTimeout, setHasLoadingTimeout] = useState(false)
  const hasOrders = useMemo(() => {
    if (!account) {
      return false
    }

    if (!ordersState) {
      return false
    }

    return Object.entries(ordersState).some(([networkId, networkState]) => {
      const resolvedChainId = Number(networkId) as SupportedChainId
      const fullState = { ...getDefaultNetworkState(resolvedChainId), ...(networkState || {}) }
      const ordersMap = flatOrdersStateNetwork(fullState)

      return Object.values(ordersMap).some(
        (order) => order?.order.owner && areAddressesEqual(order.order.owner, account),
      )
    })
  }, [account, ordersState])

  useEffect(() => {
    if (ordersFromApiStatus !== 'loading') {
      setHasLoadingTimeout(false)
      return
    }

    setHasLoadingTimeout(false)
    const timer = setTimeout(() => {
      setHasLoadingTimeout(true)
    }, AFFILIATE_ELIGIBILITY_LOADING_WARNING_MS)

    return () => {
      clearTimeout(timer)
    }
  }, [ordersFromApiStatus])

  useLayoutEffect(() => {
    if (!account) {
      actions.setWalletState({ status: 'disconnected' })
      return
    }

    if (!supportedNetwork) {
      actions.setWalletState({ status: 'unsupported', chainId })
      return
    }

    if (ordersFromApiStatus === 'error') {
      actions.setWalletState({ status: 'eligibility-unknown', reason: 'orders_fetch_failed' })
      return
    }

    if (hasLoadingTimeout) {
      actions.setWalletState({ status: 'eligibility-unknown', reason: 'orders_fetch_timeout' })
      return
    }

    if (hasOrders) {
      if (savedCode) {
        actions.setWalletState({ status: 'linked', code: savedCode })
      } else {
        actions.setWalletState({ status: 'ineligible', reason: 'This wallet already placed an order.' })
      }
      return
    }

    actions.setWalletState({ status: 'eligible' })
  }, [account, actions, chainId, hasLoadingTimeout, hasOrders, ordersFromApiStatus, savedCode, supportedNetwork])
}
