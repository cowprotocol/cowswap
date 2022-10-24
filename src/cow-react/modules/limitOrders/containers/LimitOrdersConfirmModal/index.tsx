import Modal from '@src/components/Modal'
import React, { useCallback } from 'react'
import { CurrencyAmount } from '@uniswap/sdk-core'
import { CloseIcon } from '@src/theme'
import { useAtomValue } from 'jotai/utils'
import { useHigherUSDValue } from 'hooks/useStablecoinPrice'
import { CurrencyInfo } from '@cow/common/pure/CurrencyInputPanel/typings'
import { LimitOrdersConfirm } from '../../pure/LimitOrdersConfirm'
import { tradeFlow, TradeFlowContext } from '../../services/tradeFlow'
import { limitRateAtom } from '../../state/limitRateAtom'
import * as styledEl from './styled'

export interface LimitOrdersConfirmModalProps {
  isOpen: boolean
  tradeContext: TradeFlowContext
  inputCurrencyInfo: CurrencyInfo
  outputCurrencyInfo: CurrencyInfo
  onDismiss(): void
}

export function LimitOrdersConfirmModal(props: LimitOrdersConfirmModalProps) {
  const { isOpen, inputCurrencyInfo, outputCurrencyInfo, tradeContext, onDismiss } = props

  const { activeRate } = useAtomValue(limitRateAtom)

  const outputCurrency = outputCurrencyInfo.currency
  // TODO: check with inversed rate
  const activeRateAmount = outputCurrency
    ? CurrencyAmount.fromRawAmount(outputCurrency, Number(activeRate || '0') * 10 ** outputCurrency.decimals)
    : null
  const activeRateFiatAmount = useHigherUSDValue(activeRateAmount || undefined)

  const doTrade = useCallback(() => {
    tradeContext && tradeFlow(tradeContext)
  }, [tradeContext])

  return (
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
  )
}
