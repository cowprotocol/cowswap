import React, { useCallback } from 'react'
import { Trans } from '@lingui/macro'
import { useAtomValue } from 'jotai/utils'
import { useSetAtom } from 'jotai'
import { TradeFlowContext } from 'modules/limitOrders/services/types'
import { limitOrdersSettingsAtom } from 'modules/limitOrders/state/limitOrdersSettingsAtom'
import { useLimitOrdersDerivedState } from 'modules/limitOrders/hooks/useLimitOrdersDerivedState'
import { useLimitOrdersFormState } from '../../hooks/useLimitOrdersFormState'
import { limitOrdersTradeButtonsMap, SwapButton, WrapUnwrapParams } from './limitOrdersTradeButtonsMap'
import { limitOrdersConfirmState } from '../LimitOrdersConfirmModal/state'
import { useCloseModals, useModalIsOpen, useToggleWalletModal } from 'legacy/state/application/hooks'
import { limitOrdersQuoteAtom } from 'modules/limitOrders/state/limitOrdersQuoteAtom'
import { useLimitOrdersWarningsAccepted } from 'modules/limitOrders/hooks/useLimitOrdersWarningsAccepted'
import { PriceImpact } from 'legacy/hooks/usePriceImpact'
import { useWrapCallback } from 'legacy/hooks/useWrapCallback'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { transactionConfirmAtom } from 'modules/swap/state/transactionConfirmAtom'
import { ApplicationModal } from 'legacy/state/application/reducer'
import { useErrorModal } from 'legacy/hooks/useErrorMessageAndModal'
import { CompatibilityIssuesWarning } from 'modules/trade/pure/CompatibilityIssuesWarning'
import { useWalletDetails } from 'modules/wallet'
import styled from 'styled-components/macro'
import { isUnsupportedTokenInQuote } from 'modules/limitOrders/utils/isUnsupportedTokenInQuote'
import { useHandleOrderPlacement } from 'modules/limitOrders/hooks/useHandleOrderPlacement'

const CompatibilityIssuesWarningWrapper = styled.div`
  margin-top: -10px;
`

export interface TradeButtonsProps {
  tradeContext: TradeFlowContext | null
  priceImpact: PriceImpact
  inputCurrencyAmount: CurrencyAmount<Currency> | null
  openConfirmScreen(): void
}

export function TradeButtons(props: TradeButtonsProps) {
  const { tradeContext, openConfirmScreen, priceImpact, inputCurrencyAmount } = props
  const settingsState = useAtomValue(limitOrdersSettingsAtom)
  const formState = useLimitOrdersFormState()
  const tradeState = useLimitOrdersDerivedState()
  const setConfirmationState = useSetAtom(limitOrdersConfirmState)
  const toggleWalletModal = useToggleWalletModal()
  const quote = useAtomValue(limitOrdersQuoteAtom)
  const warningsAccepted = useLimitOrdersWarningsAccepted(false)
  const wrapUnwrapCallback = useWrapCallback(inputCurrencyAmount)
  const transactionConfirmState = useAtomValue(transactionConfirmAtom)
  const closeModals = useCloseModals()
  const showTransactionConfirmationModal = useModalIsOpen(ApplicationModal.TRANSACTION_CONFIRMATION)
  const { handleSetError, ErrorModal } = useErrorModal()
  const { isSupportedWallet } = useWalletDetails()
  const { inputCurrency, outputCurrency } = tradeState
  const isSwapUnsupported = isUnsupportedTokenInQuote(quote)

  const wrapUnwrapParams: WrapUnwrapParams = {
    isNativeIn: !!inputCurrencyAmount?.currency.isNative,
    wrapUnwrapCallback,
    transactionConfirmState,
    closeModals,
    showTransactionConfirmationModal,
  }

  const tradeCallbacks = {
    beforeTrade: () => setConfirmationState({ isPending: true, orderHash: null }),
    onError: handleSetError,
    finally: () => setConfirmationState({ isPending: false, orderHash: null }),
  }
  const handleTrade = useHandleOrderPlacement(tradeContext, priceImpact, settingsState, tradeCallbacks)
  const doTrade = useCallback(() => {
    if (settingsState.expertMode) {
      handleTrade()
    } else {
      openConfirmScreen()
    }
  }, [settingsState.expertMode, handleTrade, openConfirmScreen])

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
      <ErrorModal />
    </>
  )
}
