import Modal from 'components/Modal'
import React, { useCallback } from 'react'
import { useAtom } from 'jotai'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { CloseIcon } from 'theme'
import { useAtomValue } from 'jotai/utils'
import { useHigherUSDValue } from 'hooks/useStablecoinPrice'
import { CurrencyInfo } from '@cow/common/pure/CurrencyInputPanel/typings'
import { LimitOrdersConfirm } from '../../pure/LimitOrdersConfirm'
import { tradeFlow, TradeFlowContext } from '../../services/tradeFlow'
import { limitRateAtom } from '../../state/limitRateAtom'
import TransactionConfirmationModal, { OperationType } from 'components/TransactionConfirmationModal'
import { L2Content as TxSubmittedModal } from 'components/TransactionConfirmationModal'
import { limitOrdersConfirmState } from '../LimitOrdersConfirmModal/state'
import { useWalletInfo } from 'hooks/useWalletInfo'
import { GpModal } from 'components/Modal'
import * as styledEl from './styled'
import { formatSmartAmount } from 'utils/format'

export interface LimitOrdersConfirmModalProps {
  isOpen: boolean
  tradeContext: TradeFlowContext
  inputCurrencyInfo: CurrencyInfo
  outputCurrencyInfo: CurrencyInfo
  onDismiss(): void
}

function getCurrencyAmount(currency: Currency | null, value: string | null): CurrencyAmount<Currency> | null {
  if (!currency) return null

  // TODO: think about BigNumber usage
  return CurrencyAmount.fromRawAmount(currency, Number(value || '0') * 10 ** currency.decimals)
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
  const { isOpen, inputCurrencyInfo, outputCurrencyInfo, tradeContext, onDismiss } = props
  const { chainId } = useWalletInfo()
  const { activeRate } = useAtomValue(limitRateAtom)
  const [confirmationState, setConfirmationState] = useAtom(limitOrdersConfirmState)

  const { rawAmount: inputRawAmount } = inputCurrencyInfo
  const { rawAmount: outputRawAmount, currency: outputCurrency } = outputCurrencyInfo
  // TODO: check with inversed rate
  const activeRateAmount = getCurrencyAmount(outputCurrency, activeRate)
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
  const pendingText = <PendingText inputRawAmount={inputRawAmount} outputRawAmount={outputRawAmount} />

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
