import { useAtom } from 'jotai'
import { useAtomValue } from 'jotai'
import React from 'react'

import { PriceImpact } from '../../../../legacy/hooks/usePriceImpact'

import { LimitOrdersWarnings } from '../LimitOrdersWarnings'
import { useHandleOrderPlacement } from '../../hooks/useHandleOrderPlacement'
import { useIsSafeApprovalBundle } from '../../hooks/useIsSafeApprovalBundle'
import { useLimitOrdersWarningsAccepted } from '../../hooks/useLimitOrdersWarningsAccepted'
import { useRateImpact } from '../../hooks/useRateImpact'
import { executionPriceAtom } from '../../state/executionPriceAtom'
import { limitOrdersSettingsAtom } from '../../state/limitOrdersSettingsAtom'
import { limitRateAtom } from '../../state/limitRateAtom'
import { partiallyFillableOverrideAtom } from '../../state/partiallyFillableOverride'
import { TradeConfirmation, TradeConfirmModal, useTradeConfirmActions } from '../../../trade'

import { useFeatureFlags } from '../../../../common/hooks/featureFlags/useFeatureFlags'
import { useRateInfoParams } from '../../../../common/hooks/useRateInfoParams'
import { CurrencyPreviewInfo } from '../../../../common/pure/CurrencyAmountPreview'
import { TokenSymbol } from '../../../../common/pure/TokenSymbol'

import { LOW_RATE_THRESHOLD_PERCENT } from '../../const/trade'
import { LimitOrdersDetails } from '../../pure/LimitOrdersDetails'
import { TradeFlowContext } from '../../services/types'

export interface LimitOrdersConfirmModalProps {
  tradeContext: TradeFlowContext
  inputCurrencyInfo: CurrencyPreviewInfo
  outputCurrencyInfo: CurrencyPreviewInfo
  priceImpact: PriceImpact
}

export function LimitOrdersConfirmModal(props: LimitOrdersConfirmModalProps) {
  const { inputCurrencyInfo, outputCurrencyInfo, tradeContext, priceImpact } = props
  const warningsAccepted = useLimitOrdersWarningsAccepted(true)
  const settingsState = useAtomValue(limitOrdersSettingsAtom)
  const executionPrice = useAtomValue(executionPriceAtom)
  const limitRateState = useAtomValue(limitRateAtom)
  const partiallyFillableOverride = useAtom(partiallyFillableOverrideAtom)
  const { partialFillsEnabled } = useFeatureFlags()

  const { amount: inputAmount } = inputCurrencyInfo
  const { amount: outputAmount } = outputCurrencyInfo

  const rateImpact = useRateImpact()
  const rateInfoParams = useRateInfoParams(inputAmount, outputAmount)

  const tradeConfirmActions = useTradeConfirmActions()

  const doTrade = useHandleOrderPlacement(tradeContext, priceImpact, settingsState, tradeConfirmActions)
  const isTooLowRate = rateImpact < LOW_RATE_THRESHOLD_PERCENT
  const isConfirmDisabled = isTooLowRate ? !warningsAccepted : false

  const isSafeApprovalBundle = useIsSafeApprovalBundle(inputAmount)
  const buttonText = isSafeApprovalBundle ? (
    <>
      Confirm (Approve&nbsp;
      <TokenSymbol token={inputAmount?.currency.wrapped} length={6} />
      &nbsp;& Limit order)
    </>
  ) : (
    'Place limit order'
  )

  return (
    <>
      <TradeConfirmModal>
        <TradeConfirmation
          title="Review limit order"
          inputCurrencyInfo={inputCurrencyInfo}
          outputCurrencyInfo={outputCurrencyInfo}
          onConfirm={doTrade}
          onDismiss={tradeConfirmActions.onDismiss}
          isConfirmDisabled={isConfirmDisabled}
          priceImpact={priceImpact}
          buttonText={buttonText}
        >
          <>
            <LimitOrdersDetails
              limitRateState={limitRateState}
              tradeContext={tradeContext}
              rateInfoParams={rateInfoParams}
              settingsState={settingsState}
              executionPrice={executionPrice}
              partiallyFillableOverride={partiallyFillableOverride}
              featurePartialFillsEnabled={partialFillsEnabled}
            />
            <LimitOrdersWarnings isConfirmScreen={true} priceImpact={priceImpact} />
          </>
        </TradeConfirmation>
      </TradeConfirmModal>
    </>
  )
}
