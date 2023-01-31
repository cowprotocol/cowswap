import React, { useCallback } from 'react'
import { useAtom } from 'jotai'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { CloseIcon } from 'theme'
import { CurrencyInfo } from '@cow/common/pure/CurrencyInputPanel/types'
import { LimitOrdersConfirm } from '../../pure/LimitOrdersConfirm'
import { PriceImpactDeclineError, tradeFlow, TradeFlowContext } from '../../services/tradeFlow'
import TransactionConfirmationModal, { OperationType } from 'components/TransactionConfirmationModal'
import { L2Content as TxSubmittedModal } from 'components/TransactionConfirmationModal'
import { limitOrdersConfirmState } from '../LimitOrdersConfirmModal/state'
import { useWalletInfo } from 'hooks/useWalletInfo'
import { GpModal } from 'components/Modal'
import * as styledEl from './styled'
import { formatSmartAmount } from '@cow/utils/format'
import { useRateImpact } from '@cow/modules/limitOrders/hooks/useRateImpact'
import { useRateInfoParams } from '@cow/common/hooks/useRateInfoParams'
import { LimitOrdersWarnings } from '@cow/modules/limitOrders/containers/LimitOrdersWarnings'
import { PriceImpact } from 'hooks/usePriceImpact'
import { useLimitOrdersWarningsAccepted } from '@cow/modules/limitOrders/hooks/useLimitOrdersWarningsAccepted'
import { useErrorModal } from 'hooks/useErrorMessageAndModal'
import OperatorError from '@cow/api/gnosisProtocol/errors/OperatorError'
import { useAtomValue } from 'jotai/utils'
import { limitOrdersSettingsAtom } from '@cow/modules/limitOrders/state/limitOrdersSettingsAtom'

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
  const inputSymbol = inputRawAmount?.currency?.symbol
  const outputSymbol = outputRawAmount?.currency?.symbol
  const inputTitle = (
    <span title={inputRawAmount?.toExact() + ' ' + inputSymbol}>
      {formatSmartAmount(inputRawAmount)} {inputSymbol}
    </span>
  )
  const outputTitle = (
    <span title={outputRawAmount?.toExact() + ' ' + outputSymbol}>
      {formatSmartAmount(outputRawAmount)} {outputSymbol}
    </span>
  )
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

  const { rawAmount: inputRawAmount } = inputCurrencyInfo
  const { rawAmount: outputRawAmount, currency: outputCurrency } = outputCurrencyInfo

  const rateImpact = useRateImpact()
  const rateInfoParams = useRateInfoParams(inputRawAmount, outputRawAmount)
  const { handleSetError, ErrorModal } = useErrorModal()

  const onDismissConfirmation = useCallback(() => {
    setConfirmationState({ isPending: false, orderHash: null })
  }, [setConfirmationState])

  const doTrade = useCallback(() => {
    if (!tradeContext) return

    const beforeTrade = () => {
      onDismiss()
      setConfirmationState({ isPending: true, orderHash: null })
    }

    tradeFlow(tradeContext, priceImpact, settingsState, beforeTrade)
      .then((orderHash) => {
        setConfirmationState({ isPending: false, orderHash })
      })
      .catch((error: Error) => {
        if (error instanceof PriceImpactDeclineError) return

        onDismissConfirmation()

        if (error instanceof OperatorError) {
          handleSetError(error.message)
        }
      })
  }, [onDismiss, handleSetError, settingsState, setConfirmationState, tradeContext, onDismissConfirmation, priceImpact])

  const operationType = OperationType.ORDER_SIGN
  const pendingText = <PendingText inputRawAmount={inputRawAmount} outputRawAmount={outputRawAmount} />
  const Warnings = <LimitOrdersWarnings isConfirmScreen={true} priceImpact={priceImpact} />

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
              settingsState={settingsState}
              tradeContext={tradeContext}
              rateInfoParams={rateInfoParams}
              inputCurrencyInfo={inputCurrencyInfo}
              outputCurrencyInfo={outputCurrencyInfo}
              onConfirm={doTrade}
              rateImpact={rateImpact}
              priceImpact={priceImpact}
              warningsAccepted={warningsAccepted}
              Warnings={Warnings}
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
