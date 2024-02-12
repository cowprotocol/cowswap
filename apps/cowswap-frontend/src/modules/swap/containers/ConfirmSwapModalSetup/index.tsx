import React from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useGnosisSafeInfo } from '@cowprotocol/wallet'

import { HighFeeWarning } from 'legacy/components/SwapWarnings'
import { getActivityDerivedState } from 'legacy/hooks/useActivityDerivedState'
import { PriceImpact } from 'legacy/hooks/usePriceImpact'
import { createActivityDescriptor } from 'legacy/hooks/useRecentActivity'
import { Order } from 'legacy/state/orders/actions'

import { TradeConfirmation, TradeConfirmModal, useTradeConfirmActions } from 'modules/trade'
import { NoImpactWarning } from 'modules/trade/pure/NoImpactWarning'

import { CurrencyPreviewInfo } from 'common/pure/CurrencyAmountPreview'
import { TransactionSubmittedContent } from 'common/pure/TransactionSubmittedContent'

import { useSwapConfirmButtonText } from '../../hooks/useSwapConfirmButtonText'
import { useSwapState } from '../../hooks/useSwapState'
import { TradeRates, TradeRatesProps } from '../../pure/TradeRates'

const CONFIRM_TITLE = 'Swap'

export interface ConfirmSwapModalSetupProps {
  chainId: SupportedChainId
  inputCurrencyInfo: CurrencyPreviewInfo
  outputCurrencyInfo: CurrencyPreviewInfo
  priceImpact: PriceImpact
  tradeRatesProps: TradeRatesProps
  refreshInterval: number
  doTrade(): void
}

export function ConfirmSwapModalSetup(props: ConfirmSwapModalSetupProps) {
  const { chainId, inputCurrencyInfo, outputCurrencyInfo, doTrade, priceImpact, tradeRatesProps, refreshInterval } =
    props

  const { recipient } = useSwapState()
  const gnosisSafeInfo = useGnosisSafeInfo()
  const tradeConfirmActions = useTradeConfirmActions()

  const { allowedSlippage, trade } = tradeRatesProps
  const slippageAdjustedSellAmount = trade?.maximumAmountIn(allowedSlippage)

  const buttonText = useSwapConfirmButtonText(slippageAdjustedSellAmount)

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
    <TradeConfirmModal title={CONFIRM_TITLE} submittedContent={submittedContent}>
      <TradeConfirmation
        title={CONFIRM_TITLE}
        refreshInterval={refreshInterval}
        inputCurrencyInfo={inputCurrencyInfo}
        outputCurrencyInfo={outputCurrencyInfo}
        onConfirm={doTrade}
        onDismiss={tradeConfirmActions.onDismiss}
        isConfirmDisabled={false}
        priceImpact={priceImpact}
        buttonText={buttonText}
        recipient={recipient}
      >
        <>
          <TradeRates {...tradeRatesProps} isReviewSwap={true} />
          <HighFeeWarning trade={tradeRatesProps.trade} />
          {!priceImpact.priceImpact && <NoImpactWarning isAccepted={true} withoutAccepting={true} />}
        </>
      </TradeConfirmation>
    </TradeConfirmModal>
  )
}
