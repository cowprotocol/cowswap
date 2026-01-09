import { useEffect, useMemo } from 'react'

import { areAddressesEqual } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { useAllOrdersMap } from 'legacy/state/orders/hooks'

import { ReferralContextValue } from '../types'

interface WalletSyncParams {
  account?: string
  chainId?: number
  supportedNetwork: boolean
  actions: ReferralContextValue['actions']
  savedCode?: string
}

export function useReferralWalletSync(params: WalletSyncParams): void {
  const { account, chainId, supportedNetwork, actions, savedCode } = params
  const ordersMap = useAllOrdersMap({ chainId: chainId as SupportedChainId | undefined })
  console.log('📜 LOG > useReferralWalletSync > ordersMap:', ordersMap)
  const hasOrders = useMemo(() => {
    if (!account) {
      return false
    }

    return Object.values(ordersMap).some((order) => order?.order.owner && areAddressesEqual(order.order.owner, account))
  }, [account, ordersMap])
  console.log('📜 LOG > useReferralWalletSync > hasOrders:', hasOrders)

  useEffect(() => {
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
