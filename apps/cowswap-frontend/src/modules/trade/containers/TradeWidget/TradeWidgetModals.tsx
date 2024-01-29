import React from 'react'

import { ZeroApprovalModal } from 'common/containers/ZeroApprovalModal'
import { useShouldZeroApprove } from 'common/hooks/useShouldZeroApprove'

import { useDerivedTradeState } from '../../hooks/useDerivedTradeState'

export function TradeWidgetModals() {
  const { state } = useDerivedTradeState()
  const shouldZeroApprove = useShouldZeroApprove(state?.slippageAdjustedSellAmount)

  return <>{shouldZeroApprove && <ZeroApprovalModal />}</>
}
