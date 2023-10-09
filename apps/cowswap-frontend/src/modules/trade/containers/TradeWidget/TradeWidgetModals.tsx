import React from 'react'

import { AutoImportTokens, SelectTokenWidget } from 'modules/tokensList'

import { TradeApproveModal } from 'common/containers/TradeApprove'
import { ZeroApprovalModal } from 'common/containers/ZeroApprovalModal'
import { useShouldZeroApprove } from 'common/hooks/useShouldZeroApprove'

import { useDerivedTradeState } from '../../hooks/useDerivedTradeState'
import { useTradeState } from '../../hooks/useTradeState'

export function TradeWidgetModals() {
  const { state: rawState } = useTradeState()
  const { state } = useDerivedTradeState()
  const shouldZeroApprove = useShouldZeroApprove(state?.slippageAdjustedSellAmount)

  return (
    <>
      <AutoImportTokens inputToken={rawState?.inputCurrencyId} outputToken={rawState?.outputCurrencyId} />
      {shouldZeroApprove && <ZeroApprovalModal />}
      <TradeApproveModal />
      <SelectTokenWidget />
    </>
  )
}
