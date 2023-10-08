import React from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { SelectTokenWidget } from 'modules/tokensList'

import { TradeApproveModal } from 'common/containers/TradeApprove'
import { ZeroApprovalModal } from 'common/containers/ZeroApprovalModal'
import { useShouldZeroApprove } from 'common/hooks/useShouldZeroApprove'

import { useDerivedTradeState } from '../../hooks/useDerivedTradeState'

export function TradeWidgetModals() {
  const { chainId } = useWalletInfo()
  const { state } = useDerivedTradeState()
  const shouldZeroApprove = useShouldZeroApprove(state?.slippageAdjustedSellAmount)

  return (
    <>
      {/*TODO: Refactor this to use the new tokens lib*/}
      {/*{chainId && <ImportTokenModal chainId={chainId} />}*/}
      {shouldZeroApprove && <ZeroApprovalModal />}
      <TradeApproveModal />
      <SelectTokenWidget />
    </>
  )
}
