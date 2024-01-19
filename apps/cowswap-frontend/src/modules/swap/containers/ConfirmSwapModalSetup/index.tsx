import React from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useGnosisSafeInfo } from '@cowprotocol/wallet'

import { getActivityDerivedState } from 'legacy/hooks/useActivityDerivedState'
import { PriceImpact } from 'legacy/hooks/usePriceImpact'
import { createActivityDescriptor } from 'legacy/hooks/useRecentActivity'
import { Order } from 'legacy/state/orders/actions'

import { TradeConfirmation, TradeConfirmModal, useTradeConfirmActions } from 'modules/trade'

import { CurrencyPreviewInfo } from 'common/pure/CurrencyAmountPreview'
import { TransactionSubmittedContent } from 'common/pure/TransactionSubmittedContent'

import { TradeRates, TradeRatesProps } from '../../pure/TradeRates'

export interface ConfirmSwapModalSetupProps {
  chainId: SupportedChainId
  inputCurrencyInfo: CurrencyPreviewInfo
  outputCurrencyInfo: CurrencyPreviewInfo
  priceImpact: PriceImpact
  tradeRatesProps: TradeRatesProps
  doTrade(): void
}

export function ConfirmSwapModalSetup(props: ConfirmSwapModalSetupProps) {
  const { chainId, inputCurrencyInfo, outputCurrencyInfo, doTrade, priceImpact, tradeRatesProps } = props

  const gnosisSafeInfo = useGnosisSafeInfo()
  const tradeConfirmActions = useTradeConfirmActions()

  const submittedContent = (order: Order | undefined, onDismiss: () => void) => {
    const activity = createActivityDescriptor(undefined, order)
    const activityDerivedState = getActivityDerivedState({ chainId, activityData: activity, gnosisSafeInfo })

    return (
      <TransactionSubmittedContent
        chainId={chainId}
        hash={order?.id}
        onDismiss={onDismiss}
        activityDerivedState={activityDerivedState}
      />
    )
  }

  return (
    <TradeConfirmModal submittedContent={submittedContent}>
      <TradeConfirmation
        title="Review order"
        inputCurrencyInfo={inputCurrencyInfo}
        outputCurrencyInfo={outputCurrencyInfo}
        onConfirm={doTrade}
        onDismiss={tradeConfirmActions.onDismiss}
        isConfirmDisabled={false}
        priceImpact={priceImpact}
        buttonText="Confirm Swap"
      >
        {/*TODO: RR add new component*/}
        <TradeRates {...tradeRatesProps} />
      </TradeConfirmation>
    </TradeConfirmModal>
  )
}
