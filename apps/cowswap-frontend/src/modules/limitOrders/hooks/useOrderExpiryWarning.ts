import { useAtomValue } from 'jotai'
import { useCallback, useState } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { limitOrdersSettingsAtom } from '../state/limitOrdersSettingsAtom'
import {
  getLimitOrderDeadlineDuration,
  getOrderExpiryWarningTier,
  OrderExpiryWarningTier,
} from '../utils/getOrderExpiryWarningTier.utils'
import { logOrderExpiryWarningAcknowledgement } from '../utils/logOrderExpiryWarningAcknowledgement.utils'

export interface OrderExpiryWarningState {
  tier: OrderExpiryWarningTier
  isAccepted: boolean
  isBlocking: boolean
  onAcknowledgeChange(checked: boolean): void
}

export function useOrderExpiryWarning(): OrderExpiryWarningState {
  const { account, chainId } = useWalletInfo()
  const limitOrdersSettings = useAtomValue(limitOrdersSettingsAtom)
  const [isAccepted, setIsAccepted] = useState(false)

  const deadlineDurationMs = getLimitOrderDeadlineDuration(limitOrdersSettings)
  const tier = getOrderExpiryWarningTier(deadlineDurationMs)

  const onAcknowledgeChange = useCallback(
    (checked: boolean) => {
      setIsAccepted(checked)
      logOrderExpiryWarningAcknowledgement({ isAccepted: checked, tier, deadlineDurationMs, chainId, account })
    },
    [tier, deadlineDurationMs, chainId, account],
  )

  return {
    tier,
    isAccepted,
    isBlocking: tier === OrderExpiryWarningTier.Prominent && !isAccepted,
    onAcknowledgeChange,
  }
}
