import { useLayoutEffect, useMemo } from 'react'

import { SupportedChainId, areAddressesEqual } from '@cowprotocol/cow-sdk'

import { useSelector } from 'react-redux'

import { AppState } from 'legacy/state'
import { flatOrdersStateNetwork } from 'legacy/state/orders/flatOrdersStateNetwork'
import { getDefaultNetworkState, OrdersState } from 'legacy/state/orders/reducer'

import { TraderReferralCodeContextValue } from '../state/affiliate-program-types'

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

  useLayoutEffect(() => {
    if (!account) {
      actions.setWalletState({ status: 'disconnected' })
      return
    }

    if (!supportedNetwork) {
      actions.setWalletState({ status: 'unsupported', chainId })
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
  }, [account, actions, chainId, hasOrders, savedCode, supportedNetwork])
}
