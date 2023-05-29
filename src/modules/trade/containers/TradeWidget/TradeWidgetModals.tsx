import { ImportTokenModal } from 'common/containers/ImportTokenModal'
import { ZeroApprovalModal } from 'common/containers/ZeroApprovalModal'
import { TradeApproveModal } from 'common/containers/TradeApprove'
import React from 'react'
import { useWalletInfo } from 'modules/wallet'
import { useShouldZeroApprove } from 'common/hooks/useShouldZeroApprove'
import { useDerivedTradeState } from '../../hooks/useDerivedTradeState'

export function TradeWidgetModals() {
  const { chainId } = useWalletInfo()
  const { state } = useDerivedTradeState()
  const shouldZeroApprove = useShouldZeroApprove(state?.slippageAdjustedSellAmount)

  return (
    <>
      {chainId && <ImportTokenModal chainId={chainId} />}
      {shouldZeroApprove && <ZeroApprovalModal />}
      <TradeApproveModal />
    </>
  )
}
