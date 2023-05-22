import React, { useCallback } from 'react'
import { useAtom } from 'jotai'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { CloseIcon } from 'legacy/theme'
import { CurrencyInfo } from 'common/pure/CurrencyInputPanel/types'
import { LimitOrdersConfirm } from '../../pure/LimitOrdersConfirm'
import { TradeFlowContext } from '../../services/types'
import TransactionConfirmationModal, { OperationType } from 'legacy/components/TransactionConfirmationModal'
import { limitOrdersConfirmState } from '../LimitOrdersConfirmModal/state'
import { useWalletInfo } from 'modules/wallet'
import { GpModal } from 'common/pure/Modal'
import * as styledEl from './styled'
import { useRateImpact } from 'modules/limitOrders/hooks/useRateImpact'
import { useRateInfoParams } from 'common/hooks/useRateInfoParams'
import { LimitOrdersWarnings } from 'modules/limitOrders/containers/LimitOrdersWarnings'
import { PriceImpact } from 'legacy/hooks/usePriceImpact'
import { useLimitOrdersWarningsAccepted } from 'modules/limitOrders/hooks/useLimitOrdersWarningsAccepted'
import { useErrorModal } from 'legacy/hooks/useErrorMessageAndModal'
import { useAtomValue } from 'jotai/utils'
import { limitOrdersSettingsAtom } from 'modules/limitOrders/state/limitOrdersSettingsAtom'
import { TokenAmount } from 'common/pure/TokenAmount'
import { executionPriceAtom } from 'modules/limitOrders/state/executionPriceAtom'
import { limitRateAtom } from 'modules/limitOrders/state/limitRateAtom'
import { useHandleOrderPlacement } from 'modules/limitOrders/hooks/useHandleOrderPlacement'
import { partiallyFillableOverrideAtom } from 'modules/limitOrders/state/partiallyFillableOverride'
import { useFeatureFlags } from 'common/hooks/useFeatureFlags'
import { L2Content as TxSubmittedModal } from 'legacy/components/TransactionConfirmationModal'
import { useIsSafeApprovalBundle } from 'modules/limitOrders/hooks/useIsSafeApprovalBundle'
import { TokenSymbol } from 'common/pure/TokenSymbol'

export interface LimitOrdersConfirmModalProps {
  isOpen: boolean
  tradeContext: TradeFlowContext
  inputCurrencyInfo: CurrencyInfo
  outputCurrencyInfo: CurrencyInfo
  priceImpact: PriceImpact
  onDismiss(): void
}

function PendingText({
  inputRawAmount,
  outputRawAmount,
}: {
  inputRawAmount: CurrencyAmount<Currency> | null
  outputRawAmount: CurrencyAmount<Currency> | null
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
  const { amount: outputAmount, currency: outputCurrency } = outputCurrencyInfo

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

  const operationType = OperationType.ORDER_SIGN
  const pendingText = <PendingText inputRawAmount={inputAmount} outputRawAmount={outputAmount} />
  const Warnings = <LimitOrdersWarnings isConfirmScreen={true} priceImpact={priceImpact} />

  const isSafeApprovalBundle = useIsSafeApprovalBundle(inputAmount)
  const buttonText = isSafeApprovalBundle ? (
    <>
      Confirm (Approve&nbsp;
      <TokenSymbol token={inputAmount?.currency.wrapped} length={6} />
      &nbsp;& Limit order)
    </>
  ) : undefined

  return (
    <>
      <GpModal isOpen={isOpen} onDismiss={onDismiss}>
        {tradeContext && (
          <styledEl.ConfirmModalWrapper>
            <styledEl.ConfirmHeader>
              <styledEl.ConfirmHeaderTitle>Review limit order</styledEl.ConfirmHeaderTitle>
              <CloseIcon onClick={() => onDismiss()} />
            </styledEl.ConfirmHeader>
            <LimitOrdersConfirm
              executionPrice={executionPrice}
              limitRateState={limitRateState}
              settingsState={settingsState}
              tradeContext={tradeContext}
              rateInfoParams={rateInfoParams}
              inputCurrencyInfo={inputCurrencyInfo}
              outputCurrencyInfo={outputCurrencyInfo}
              onConfirm={doTrade}
              rateImpact={rateImpact}
              priceImpact={priceImpact}
              warningsAccepted={warningsAccepted}
              partiallyFillableOverride={partiallyFillableOverride}
              featurePartialFillsEnabled={partialFillsEnabled}
              Warnings={Warnings}
              buttonText={buttonText}
            />
          </styledEl.ConfirmModalWrapper>
        )}
      </GpModal>
      {chainId && (
        <GpModal isOpen={!!confirmationState.orderHash} onDismiss={onDismissConfirmation}>
          <TxSubmittedModal
            isLimitOrderSubmit
            chainId={chainId}
            onDismiss={onDismissConfirmation}
            hash={confirmationState.orderHash || undefined}
            pendingText={''}
            inline={true}
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
