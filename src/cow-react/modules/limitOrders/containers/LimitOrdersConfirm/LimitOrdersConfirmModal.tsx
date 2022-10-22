import Modal from '@src/components/Modal'
import React, { useCallback } from 'react'
import { tradeFlow, TradeFlowContext } from '@cow/modules/limitOrders/services/tradeFlow'
import { CurrencyInfo } from '@cow/common/pure/CurrencyInputPanel/typings'
import { LimitOrdersConfirm } from './LimitOrdersConfirm'
import { CloseIcon } from '@src/theme'
import * as styledEl from './styled'

export interface LimitOrdersConfirmModalProps {
  isOpen: boolean
  tradeContext: TradeFlowContext
  inputCurrencyInfo: CurrencyInfo
  outputCurrencyInfo: CurrencyInfo
  onDismiss(): void
}

export function LimitOrdersConfirmModal(props: LimitOrdersConfirmModalProps) {
  const { isOpen, tradeContext, inputCurrencyInfo, outputCurrencyInfo, onDismiss } = props

  const doTrade = useCallback(() => {
    tradeContext && tradeFlow(tradeContext)
  }, [tradeContext])

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss} maxHeight={100}>
      {tradeContext && (
        <styledEl.ConfirmModalWrapper>
          <styledEl.ConfirmHeader>
            <styledEl.ConfirmHeaderTitle>Review limit order</styledEl.ConfirmHeaderTitle>
            <CloseIcon onClick={() => onDismiss()} />
          </styledEl.ConfirmHeader>
          <LimitOrdersConfirm
            inputCurrencyInfo={inputCurrencyInfo}
            outputCurrencyInfo={outputCurrencyInfo}
            onConfirm={doTrade}
          />
        </styledEl.ConfirmModalWrapper>
      )}
    </Modal>
  )
}
