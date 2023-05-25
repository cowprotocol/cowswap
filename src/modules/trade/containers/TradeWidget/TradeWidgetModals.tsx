import { ImportTokenModal } from 'common/containers/ImportTokenModal'
import { ZeroApprovalModal } from 'common/containers/ZeroApprovalModal'
import { TradeApproveModal } from 'common/containers/TradeApprove'
import React from 'react'
import { useWalletInfo } from 'modules/wallet'
import { useShouldZeroApproveSwap } from 'common/hooks/useShouldZeroApproveSwap'

export function TradeWidgetModals() {
  const { chainId } = useWalletInfo()
  const shouldZeroApprove = useShouldZeroApproveSwap()

  return (
    <>
      {chainId && <ImportTokenModal chainId={chainId} />}
      {shouldZeroApprove && <ZeroApprovalModal />}
      <TradeApproveModal />
    </>
  )
}
