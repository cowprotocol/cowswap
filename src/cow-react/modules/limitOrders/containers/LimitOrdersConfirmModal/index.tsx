import Modal from '@src/components/Modal'
import React, { useCallback, useState } from 'react'
import { CurrencyAmount } from '@uniswap/sdk-core'
import { CloseIcon } from '@src/theme'
import { useAtomValue } from 'jotai/utils'
import { useHigherUSDValue } from 'hooks/useStablecoinPrice'
import { CurrencyInfo } from '@cow/common/pure/CurrencyInputPanel/typings'
import { LimitOrdersConfirm } from '../../pure/LimitOrdersConfirm'
import { tradeFlow, TradeFlowContext } from '../../services/tradeFlow'
import { limitRateAtom } from '../../state/limitRateAtom'
import TransactionConfirmationModal, { OperationType } from 'components/TransactionConfirmationModal'
import * as styledEl from './styled'

export interface LimitOrdersConfirmModalProps {
  isOpen: boolean
  tradeContext: TradeFlowContext
  inputCurrencyInfo: CurrencyInfo
  outputCurrencyInfo: CurrencyInfo
  onDismiss(): void
}

interface LimitOrderConfirmationState {
  isPending: boolean
  orderHash: string | null
}

export function LimitOrdersConfirmModal(props: LimitOrdersConfirmModalProps) {
  const { isOpen, inputCurrencyInfo, outputCurrencyInfo, tradeContext, onDismiss } = props

  const { activeRate } = useAtomValue(limitRateAtom)
  const [confirmationState, setConfirmationState] = useState<LimitOrderConfirmationState>({
    isPending: false,
    orderHash: null,
  })

  const { viewAmount: inputViewAmount, currency: inputCurrency } = inputCurrencyInfo
  const { viewAmount: outputViewAmount, currency: outputCurrency } = outputCurrencyInfo
  // TODO: check with inversed rate
  const activeRateAmount = outputCurrency
    ? CurrencyAmount.fromRawAmount(outputCurrency, Number(activeRate || '0') * 10 ** outputCurrency.decimals)
    : null
  const activeRateFiatAmount = useHigherUSDValue(activeRateAmount || undefined)

  const onDismissConfirmation = useCallback(() => {
    setConfirmationState({ isPending: false, orderHash: null })
  }, [setConfirmationState])

  const doTrade = useCallback(() => {
    if (!tradeContext) return

    onDismiss()
    setConfirmationState({ isPending: true, orderHash: null })

    tradeFlow(tradeContext)
      .then((orderHash) => {
        setConfirmationState({ isPending: false, orderHash })
      })
      .catch(() => {
        onDismissConfirmation()
      })
  }, [onDismiss, setConfirmationState, tradeContext, onDismissConfirmation])

  const operationType = OperationType.ORDER_SIGN
  const pendingText = `Placing limit order ${inputViewAmount} ${inputCurrency?.symbol} for ${outputViewAmount} ${outputCurrency?.symbol}`

  return (
    <>
      <Modal isOpen={isOpen} onDismiss={onDismiss} maxHeight={100}>
        {tradeContext && activeRate && (
          <styledEl.ConfirmModalWrapper>
            <styledEl.ConfirmHeader>
              <styledEl.ConfirmHeaderTitle>Review limit order</styledEl.ConfirmHeaderTitle>
              <CloseIcon onClick={() => onDismiss()} />
            </styledEl.ConfirmHeader>
            <LimitOrdersConfirm
              tradeContext={tradeContext}
              activeRateFiatAmount={activeRateFiatAmount}
              activeRate={activeRate}
              inputCurrencyInfo={inputCurrencyInfo}
              outputCurrencyInfo={outputCurrencyInfo}
              onConfirm={doTrade}
            />
          </styledEl.ConfirmModalWrapper>
        )}
      </Modal>
      {outputCurrency && (
        <TransactionConfirmationModal
          isOpen={confirmationState.isPending || !!confirmationState.orderHash}
          operationType={operationType}
          currencyToAdd={outputCurrency}
          pendingText={pendingText}
          onDismiss={onDismissConfirmation}
          attemptingTxn={confirmationState.isPending}
          hash={confirmationState.orderHash || undefined}
        />
      )}
    </>
  )
}
