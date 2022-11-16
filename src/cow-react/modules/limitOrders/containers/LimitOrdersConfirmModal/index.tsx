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
import { formatSmartAmount } from 'utils/format'
import { useRateImpact } from '@cow/modules/limitOrders/hooks/useRateImpact'
import { useActiveRateDisplay } from '@cow/modules/limitOrders/hooks/useActiveRateDisplay'
import { LimitOrdersWarnings } from '@cow/modules/limitOrders/containers/LimitOrdersWarnings'
import { PriceImpact } from 'hooks/usePriceImpact'
import { useLimitOrdersWarningsAccepted } from '@cow/modules/limitOrders/hooks/useLimitOrdersWarningsAccepted'

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

  const { rawAmount: inputRawAmount } = inputCurrencyInfo
  const { rawAmount: outputRawAmount, currency: outputCurrency } = outputCurrencyInfo

  const rateImpact = useRateImpact()
  const activeRateDisplay = useActiveRateDisplay()

  const onDismissConfirmation = useCallback(() => {
    setConfirmationState({ isPending: false, orderHash: null })
  }, [setConfirmationState])

  const doTrade = useCallback(() => {
    if (!tradeContext) return

    const beforeTrade = () => {
      onDismiss()
      setConfirmationState({ isPending: true, orderHash: null })
    }

    tradeFlow(tradeContext, priceImpact, beforeTrade)
      .then((orderHash) => {
        setConfirmationState({ isPending: false, orderHash })
      })
      .catch((error: Error) => {
        if (error instanceof PriceImpactDeclineError) return

        onDismissConfirmation()
      })
  }, [onDismiss, setConfirmationState, tradeContext, onDismissConfirmation, priceImpact])

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
              tradeContext={tradeContext}
              activeRateDisplay={activeRateDisplay}
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
    </>
  )
}
