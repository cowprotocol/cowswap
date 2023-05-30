import { useAtom } from 'jotai'
import { useAtomValue } from 'jotai/utils'
import React, { useCallback } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { ConfirmOperationType, TransactionConfirmationModal } from 'legacy/components/TransactionConfirmationModal'
import { useErrorModal } from 'legacy/hooks/useErrorMessageAndModal'
import { PriceImpact } from 'legacy/hooks/usePriceImpact'
import { CloseIcon } from 'legacy/theme'

import { LimitOrdersWarnings } from 'modules/limitOrders/containers/LimitOrdersWarnings'
import { useHandleOrderPlacement } from 'modules/limitOrders/hooks/useHandleOrderPlacement'
import { useIsSafeApprovalBundle } from 'modules/limitOrders/hooks/useIsSafeApprovalBundle'
import { useLimitOrdersWarningsAccepted } from 'modules/limitOrders/hooks/useLimitOrdersWarningsAccepted'
import { useRateImpact } from 'modules/limitOrders/hooks/useRateImpact'
import { executionPriceAtom } from 'modules/limitOrders/state/executionPriceAtom'
import { limitOrdersSettingsAtom } from 'modules/limitOrders/state/limitOrdersSettingsAtom'
import { limitRateAtom } from 'modules/limitOrders/state/limitRateAtom'
import { partiallyFillableOverrideAtom } from 'modules/limitOrders/state/partiallyFillableOverride'
import { TradeConfirmation } from 'modules/trade/pure/TradeConfirmation'
import { useWalletInfo } from 'modules/wallet'

import { useFeatureFlags } from 'common/hooks/useFeatureFlags'
import { useRateInfoParams } from 'common/hooks/useRateInfoParams'
import { CurrencyPreviewInfo } from 'common/pure/CurrencyAmountPreview'
import { GpModal } from 'common/pure/Modal'
import { OrderSubmittedContent } from 'common/pure/OrderSubmittedContent'
import { TokenAmount } from 'common/pure/TokenAmount'
import { TokenSymbol } from 'common/pure/TokenSymbol'

import * as styledEl from './styled'

import { LOW_RATE_THRESHOLD_PERCENT } from '../../const/trade'
import { LimitOrdersDetails } from '../../pure/LimitOrdersDetails'
import { TradeFlowContext } from '../../services/types'
import { limitOrdersConfirmState } from '../LimitOrdersConfirmModal/state'

export interface LimitOrdersConfirmModalProps {
  isOpen: boolean
  tradeContext: TradeFlowContext
  inputCurrencyInfo: CurrencyPreviewInfo
  outputCurrencyInfo: CurrencyPreviewInfo
  priceImpact: PriceImpact
  onDismiss(): void
}

function PendingText({
  inputRawAmount,
  outputRawAmount,
}: {
  inputRawAmount: Nullish<CurrencyAmount<Currency>>
  outputRawAmount: Nullish<CurrencyAmount<Currency>>
}) {
  const inputTitle = <TokenAmount amount={inputRawAmount} tokenSymbol={inputRawAmount?.currency} />
  const outputTitle = <TokenAmount amount={outputRawAmount} tokenSymbol={outputRawAmount?.currency} />
  return (
    <>
      Placing limit order {inputTitle} for {outputTitle}
    </>
  )
}

export function LimitOrdersConfirmModal(props: LimitOrdersConfirmModalProps) {
  const { isOpen, inputCurrencyInfo, outputCurrencyInfo, tradeContext, onDismiss, priceImpact } = props
  const { chainId } = useWalletInfo()
  const [confirmationState, setConfirmationState] = useAtom(limitOrdersConfirmState)
  const warningsAccepted = useLimitOrdersWarningsAccepted(true)
  const settingsState = useAtomValue(limitOrdersSettingsAtom)
  const executionPrice = useAtomValue(executionPriceAtom)
  const limitRateState = useAtomValue(limitRateAtom)
  const partiallyFillableOverride = useAtom(partiallyFillableOverrideAtom)
  const { partialFillsEnabled } = useFeatureFlags()

  const { amount: inputAmount } = inputCurrencyInfo
  const { amount: outputAmount } = outputCurrencyInfo

  const outputCurrency = outputAmount?.currency

  const rateImpact = useRateImpact()
  const rateInfoParams = useRateInfoParams(inputAmount, outputAmount)
  const { handleSetError, ErrorModal } = useErrorModal()

  const onDismissConfirmation = useCallback(() => {
    setConfirmationState({ isPending: false, orderHash: null })
  }, [setConfirmationState])

  const tradeCallbacks = {
    beforeTrade: () => {
      onDismiss()
      setConfirmationState({ isPending: true, orderHash: null })
    },
    onTradeSuccess: (orderHash: string | null) => setConfirmationState({ isPending: false, orderHash }),
    onDismissConfirmation,
    onError: handleSetError,
  }
  const doTrade = useHandleOrderPlacement(tradeContext, priceImpact, settingsState, tradeCallbacks)

  const operationType = ConfirmOperationType.ORDER_SIGN
  const pendingText = <PendingText inputRawAmount={inputAmount} outputRawAmount={outputAmount} />

  const isTooLowRate = rateImpact < LOW_RATE_THRESHOLD_PERCENT
  const isConfirmDisabled = isTooLowRate ? !warningsAccepted : false

  const isSafeApprovalBundle = useIsSafeApprovalBundle(inputAmount)
  const buttonText = isSafeApprovalBundle ? (
    <>
      Confirm (Approve&nbsp;
      <TokenSymbol token={inputAmount?.currency.wrapped} length={6} />
      &nbsp;& Limit order)
    </>
  ) : undefined

  // TODO: use TradeConfirmModal
  return (
    <>
      <GpModal isOpen={isOpen} onDismiss={onDismiss}>
        {tradeContext && (
          <styledEl.ConfirmModalWrapper>
            <styledEl.ConfirmHeader>
              <styledEl.ConfirmHeaderTitle>Review limit order</styledEl.ConfirmHeaderTitle>
              <CloseIcon onClick={() => onDismiss()} />
            </styledEl.ConfirmHeader>
            <TradeConfirmation
              inputCurrencyInfo={inputCurrencyInfo}
              outputCurrencyInfo={outputCurrencyInfo}
              onConfirm={doTrade}
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
          </styledEl.ConfirmModalWrapper>
        )}
      </GpModal>
      {chainId && confirmationState.orderHash && (
        <GpModal isOpen={true} onDismiss={onDismissConfirmation}>
          <OrderSubmittedContent
            chainId={chainId}
            onDismiss={onDismissConfirmation}
            hash={confirmationState.orderHash}
          />
        </GpModal>
      )}
      {outputCurrency && (
        <TransactionConfirmationModal
          isOpen={confirmationState.isPending}
          operationType={operationType}
          currencyToAdd={outputCurrency}
          pendingText={pendingText}
          onDismiss={onDismissConfirmation}
          attemptingTxn={confirmationState.isPending}
        />
      )}
      <ErrorModal />
    </>
  )
}
