import { useSetAtom } from 'jotai'
import { useAtomValue } from 'jotai/utils'
import React, { useCallback } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Trans } from '@lingui/macro'
import styled from 'styled-components/macro'

import { useErrorModal } from 'legacy/hooks/useErrorMessageAndModal'
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
import { CompatibilityIssuesWarning } from 'modules/trade/pure/CompatibilityIssuesWarning'
import { useTradeQuote } from 'modules/tradeQuote'
import { useWalletDetails } from 'modules/wallet'

import { limitOrdersTradeButtonsMap, SwapButton, WrapUnwrapParams } from './limitOrdersTradeButtonsMap'

import { useLimitOrdersFormState } from '../../hooks/useLimitOrdersFormState'
import { limitOrdersConfirmState } from '../LimitOrdersConfirmModal/state'

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
  const quote = useTradeQuote()
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
