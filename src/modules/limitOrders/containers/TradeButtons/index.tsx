import { useAtomValue } from 'jotai/utils'
import React, { useCallback } from 'react'

import { Trans } from '@lingui/macro'
import styled from 'styled-components/macro'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'
import { useWrapCallback } from 'legacy/hooks/useWrapCallback'
import { useCloseModals, useModalIsOpen, useToggleWalletModal } from 'legacy/state/application/hooks'
import { ApplicationModal } from 'legacy/state/application/reducer'

import { useHandleOrderPlacement } from 'modules/limitOrders/hooks/useHandleOrderPlacement'
import { useLimitOrdersDerivedState } from 'modules/limitOrders/hooks/useLimitOrdersDerivedState'
import { useLimitOrdersWarningsAccepted } from 'modules/limitOrders/hooks/useLimitOrdersWarningsAccepted'
import { TradeFlowContext } from 'modules/limitOrders/services/types'
import { limitOrdersSettingsAtom } from 'modules/limitOrders/state/limitOrdersSettingsAtom'
import { isUnsupportedTokenInQuote } from 'modules/limitOrders/utils/isUnsupportedTokenInQuote'
import { transactionConfirmAtom } from 'modules/swap/state/transactionConfirmAtom'
import { useTradeConfirmActions } from 'modules/trade/hooks/useTradeConfirmActions'
import { CompatibilityIssuesWarning } from 'modules/trade/pure/CompatibilityIssuesWarning'
import { useTradeQuote } from 'modules/tradeQuote'
import { useWalletDetails } from 'modules/wallet'

import { limitOrdersTradeButtonsMap, SwapButton, WrapUnwrapParams } from './limitOrdersTradeButtonsMap'

import { useLimitOrdersFormState } from '../../hooks/useLimitOrdersFormState'

const CompatibilityIssuesWarningWrapper = styled.div`
  margin-top: -10px;
`

export interface TradeButtonsProps {
  tradeContext: TradeFlowContext | null
  priceImpact: PriceImpact
}

export function TradeButtons(props: TradeButtonsProps) {
  const { tradeContext, priceImpact } = props
  const inputCurrencyAmount = tradeContext?.postOrderParams.inputAmount

  const settingsState = useAtomValue(limitOrdersSettingsAtom)
  const formState = useLimitOrdersFormState()
  const tradeState = useLimitOrdersDerivedState()
  const toggleWalletModal = useToggleWalletModal()
  const quote = useTradeQuote()
  const warningsAccepted = useLimitOrdersWarningsAccepted(false)
  const wrapUnwrapCallback = useWrapCallback(inputCurrencyAmount)
  const transactionConfirmState = useAtomValue(transactionConfirmAtom)
  const closeModals = useCloseModals()
  const showTransactionConfirmationModal = useModalIsOpen(ApplicationModal.TRANSACTION_CONFIRMATION)
  const { isSupportedWallet } = useWalletDetails()
  const { inputCurrency, outputCurrency } = tradeState
  const isSwapUnsupported = isUnsupportedTokenInQuote(quote)
  const tradeConfirmActions = useTradeConfirmActions()

  const wrapUnwrapParams: WrapUnwrapParams = {
    isNativeIn: !!inputCurrencyAmount?.currency.isNative,
    wrapUnwrapCallback,
    transactionConfirmState,
    closeModals,
    showTransactionConfirmationModal,
  }

  const handleTrade = useHandleOrderPlacement(tradeContext, priceImpact, settingsState, tradeConfirmActions)

  const doTrade = useCallback(() => {
    if (settingsState.expertMode) {
      handleTrade()
    } else {
      tradeConfirmActions.onOpen()
    }
  }, [settingsState.expertMode, handleTrade, tradeConfirmActions])

  const buttonFactory = limitOrdersTradeButtonsMap[formState]

  const isButtonDisabled = (typeof buttonFactory !== 'function' && buttonFactory.disabled) || !warningsAccepted
  const showWarnings = !!(inputCurrency && outputCurrency && isSwapUnsupported)

  const Button =
    typeof buttonFactory === 'function' ? (
      buttonFactory({ tradeState, toggleWalletModal, quote, wrapUnwrapParams, doTrade })
    ) : (
      <SwapButton id={buttonFactory.id} onClick={doTrade} disabled={isButtonDisabled}>
        <Trans>{buttonFactory.text}</Trans>
      </SwapButton>
    )

  return (
    <>
      {Button}
      {showWarnings && (
        <CompatibilityIssuesWarningWrapper>
          <CompatibilityIssuesWarning
            currencyIn={inputCurrency}
            currencyOut={outputCurrency}
            isSupportedWallet={isSupportedWallet}
          />
        </CompatibilityIssuesWarningWrapper>
      )}
    </>
  )
}
