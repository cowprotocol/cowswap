import React, { useCallback } from 'react'
import { Trans } from '@lingui/macro'
import { useAtomValue } from 'jotai/utils'
import { useSetAtom } from 'jotai'
import { PriceImpactDeclineError, tradeFlow, TradeFlowContext } from '@cow/modules/limitOrders/services/tradeFlow'
import { limitOrdersSettingsAtom } from '@cow/modules/limitOrders/state/limitOrdersSettingsAtom'
import { useLimitOrdersTradeState } from '@cow/modules/limitOrders/hooks/useLimitOrdersTradeState'
import { useLimitOrdersFormState } from '../../hooks/useLimitOrdersFormState'
import { limitOrdersTradeButtonsMap, SwapButton, WrapUnwrapParams } from './limitOrdersTradeButtonsMap'
import { limitOrdersConfirmState } from '../LimitOrdersConfirmModal/state'
import { useCloseModals, useModalIsOpen, useToggleWalletModal } from 'state/application/hooks'
import { limitOrdersQuoteAtom } from '@cow/modules/limitOrders/state/limitOrdersQuoteAtom'
import { useLimitOrdersWarningsAccepted } from '@cow/modules/limitOrders/hooks/useLimitOrdersWarningsAccepted'
import { PriceImpact } from 'hooks/usePriceImpact'
import { useWrapCallback } from 'hooks/useWrapCallback'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { transactionConfirmAtom } from '@cow/modules/swap/state/transactionConfirmAtom'
import { ApplicationModal } from '@src/state/application/reducer'
import { useErrorModal } from 'hooks/useErrorMessageAndModal'
import OperatorError from '@cow/api/gnosisProtocol/errors/OperatorError'

export interface TradeButtonsProps {
  tradeContext: TradeFlowContext | null
  priceImpact: PriceImpact
  inputCurrencyAmount: CurrencyAmount<Currency> | null
  openConfirmScreen(): void
}

export function TradeButtons(props: TradeButtonsProps) {
  const { tradeContext, openConfirmScreen, priceImpact, inputCurrencyAmount } = props
  const { expertMode } = useAtomValue(limitOrdersSettingsAtom)
  const formState = useLimitOrdersFormState()
  const tradeState = useLimitOrdersTradeState()
  const setConfirmationState = useSetAtom(limitOrdersConfirmState)
  const toggleWalletModal = useToggleWalletModal()
  const quote = useAtomValue(limitOrdersQuoteAtom)
  const warningsAccepted = useLimitOrdersWarningsAccepted(false)
  const wrapUnwrapCallback = useWrapCallback(inputCurrencyAmount)
  const transactionConfirmState = useAtomValue(transactionConfirmAtom)
  const closeModals = useCloseModals()
  const showTransactionConfirmationModal = useModalIsOpen(ApplicationModal.TRANSACTION_CONFIRMATION)
  const { handleSetError, ErrorModal } = useErrorModal()

  const wrapUnwrapParams: WrapUnwrapParams = {
    isNativeIn: !!inputCurrencyAmount?.currency.isNative,
    wrapUnwrapCallback,
    transactionConfirmState,
    closeModals,
    showTransactionConfirmationModal,
  }

  const doTrade = useCallback(() => {
    if (expertMode && tradeContext) {
      const beforeTrade = () => setConfirmationState({ isPending: true, orderHash: null })

      tradeFlow(tradeContext, priceImpact, beforeTrade)
        .catch((error) => {
          if (error instanceof PriceImpactDeclineError) return

          if (error instanceof OperatorError) {
            handleSetError(error.message)
          }
        })
        .finally(() => {
          setConfirmationState({ isPending: false, orderHash: null })
        })
    } else {
      openConfirmScreen()
    }
  }, [handleSetError, expertMode, tradeContext, openConfirmScreen, setConfirmationState, priceImpact])

  const button = limitOrdersTradeButtonsMap[formState]

  if (typeof button === 'function') {
    return button({ tradeState, toggleWalletModal, quote, wrapUnwrapParams })
  }

  const isButtonDisabled = button.disabled || !warningsAccepted

  return (
    <>
      <SwapButton onClick={doTrade} disabled={isButtonDisabled}>
        <Trans>{button.text}</Trans>
      </SwapButton>
      <ErrorModal />
    </>
  )
}
