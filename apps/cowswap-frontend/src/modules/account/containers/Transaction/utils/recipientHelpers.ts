import { areAddressesEqual } from '@cowprotocol/common-utils'

import { ActivityDerivedState } from 'common/types/activity'
import { getIsCustomRecipient } from 'utils/orderUtils/getIsCustomRecipient'

export function computeCustomRecipientState(
  order: ActivityDerivedState['order'],
  isBridgeOrder: boolean,
  swapAndBridgeOverview: { targetRecipient?: string } | undefined
): { recipient: string | undefined; isCustomRecipient: boolean } {
  const recipient = isBridgeOrder 
    ? swapAndBridgeOverview?.targetRecipient 
    : order?.receiver
  
  const isCustomRecipient = !!order && (
    isBridgeOrder 
      ? (recipient ? !areAddressesEqual(order.owner, recipient) : false)
      : getIsCustomRecipient(order)
  )
  
  return { recipient, isCustomRecipient }
}