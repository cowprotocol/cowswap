/* eslint-disable complexity */
import React, { ReactNode } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { useIsSafeWallet } from '@cowprotocol/wallet'

import { useLingui } from '@lingui/react/macro'

import { AddIntermediateToken } from 'modules/tokensList'
import {
  useConfirmTradeWithRwaCheck,
  useIsCurrentTradeBridging,
  useIsNoImpactWarningAccepted,
  useWrappedToken,
} from 'modules/trade'
import {
  useShouldConfirmRecipient,
  useSmartContractRecipientConfirmed,
} from 'modules/trade/hooks/useSmartContractRecipientConfirmed'
import {
  TradeFormButtons,
  TradeFormValidation,
  useGetTradeFormValidation,
  useIsTradeFormValidationPassed,
  useTradeFormButtonContext,
} from 'modules/tradeFormValidation'
import { useHighFeeWarning } from 'modules/tradeWidgetAddons'

import { useSafeMemoObject } from 'common/hooks/useSafeMemo'

import { swapTradeButtonsMap } from './swapTradeButtonsMap'

import { useOnCurrencySelection } from '../../hooks/useOnCurrencySelection'
import { useSwapDerivedState } from '../../hooks/useSwapDerivedState'
import { useSwapFormState } from '../../hooks/useSwapFormState'

interface TradeButtonsProps {
  isTradeContextReady: boolean

  openNativeWrapModal(): void

  hasEnoughWrappedBalanceForSwap: boolean
  tokenToBeImported: boolean
  intermediateBuyToken: TokenWithLogo | null
  setShowAddIntermediateTokenModal: (show: boolean) => void
}

export function TradeButtons({
  isTradeContextReady,
  openNativeWrapModal,
  hasEnoughWrappedBalanceForSwap,
  tokenToBeImported,
  intermediateBuyToken,
  setShowAddIntermediateTokenModal,
}: TradeButtonsProps): ReactNode {
  const { inputCurrency } = useSwapDerivedState()

  const primaryFormValidation = useGetTradeFormValidation()
  const isPrimaryValidationPassed = useIsTradeFormValidationPassed()
  const { feeWarningAccepted } = useHighFeeWarning()
  const isNoImpactWarningAccepted = useIsNoImpactWarningAccepted()
  const localFormValidation = useSwapFormState()
  const wrappedToken = useWrappedToken()
  const onCurrencySelection = useOnCurrencySelection()
  const isCurrentTradeBridging = useIsCurrentTradeBridging()
  const shouldConfirmRecipient = useShouldConfirmRecipient()
  const smartContractRecipientConfirmed = useSmartContractRecipientConfirmed()
  const isSafeWallet = useIsSafeWallet()

  const { t } = useLingui()

  const { confirmTrade } = useConfirmTradeWithRwaCheck()

  const isRecipientConfirmationBlocking = shouldConfirmRecipient && !smartContractRecipientConfirmed
  const baseDisabled = !isTradeContextReady || !feeWarningAccepted || !isNoImpactWarningAccepted
  const isRecipientConfirmationOnlyDisabled =
    isRecipientConfirmationBlocking &&
    !baseDisabled &&
    (primaryFormValidation === null ||
      primaryFormValidation === TradeFormValidation.ApproveRequired ||
      primaryFormValidation === TradeFormValidation.ApproveAndSwapInBundle)
  const recipientConfirmationLabel = isRecipientConfirmationOnlyDisabled ? t`Confirm recipient to swap` : undefined

  const confirmText = isRecipientConfirmationOnlyDisabled
    ? t`Confirm recipient to swap`
    : isCurrentTradeBridging
      ? t`Swap and Bridge`
      : t`Swap`

  // enable partial approve only for swap
  const tradeFormButtonContext = useTradeFormButtonContext(confirmText, confirmTrade, true, recipientConfirmationLabel)

  const context = useSafeMemoObject({
    wrappedToken,
    onEthFlow: openNativeWrapModal,
    openSwapConfirm: confirmTrade,
    inputCurrency,
    hasEnoughWrappedBalanceForSwap,
    onCurrencySelection,
    confirmText,
    isSafeWallet,
    isCurrentTradeBridging,
  })

  const shouldShowAddIntermediateToken =
    tokenToBeImported &&
    !!intermediateBuyToken &&
    primaryFormValidation === TradeFormValidation.ImportingIntermediateToken

  const isDisabled = baseDisabled || isRecipientConfirmationBlocking

  if (!tradeFormButtonContext) return null

  if (localFormValidation && isPrimaryValidationPassed) {
    return swapTradeButtonsMap[localFormValidation](context, isDisabled)
  }

  return (
    <>
      <TradeFormButtons
        confirmText={confirmText}
        validation={primaryFormValidation}
        context={tradeFormButtonContext}
        isDisabled={isDisabled}
      />
      {shouldShowAddIntermediateToken && (
        <AddIntermediateToken
          intermediateBuyToken={intermediateBuyToken!}
          onImport={() => setShowAddIntermediateTokenModal(true)}
        />
      )}
    </>
  )
}
