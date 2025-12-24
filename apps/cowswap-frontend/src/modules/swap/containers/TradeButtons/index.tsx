import React, { ReactNode, useCallback } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { useIsSafeWallet } from '@cowprotocol/wallet'

import { useLingui } from '@lingui/react/macro'

import { useRwaConsentModalState } from 'modules/rwa/hooks/useRwaConsentModalState'
import { RwaTokenStatus, useRwaTokenStatus } from 'modules/rwa/hooks/useRwaTokenStatus'
import { AddIntermediateToken } from 'modules/tokensList'
import {
  useIsCurrentTradeBridging,
  useIsNoImpactWarningAccepted,
  useTradeConfirmActions,
  useWrappedToken,
} from 'modules/trade'
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
import {
  useShouldCheckBridgingRecipient,
  useSmartContractRecipientConfirmed,
} from '../../hooks/useSmartContractRecipientConfirmed'
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

// eslint-disable-next-line max-lines-per-function
export function TradeButtons({
  isTradeContextReady,
  openNativeWrapModal,
  hasEnoughWrappedBalanceForSwap,
  tokenToBeImported,
  intermediateBuyToken,
  setShowAddIntermediateTokenModal,
}: TradeButtonsProps): ReactNode {
  const { inputCurrency, outputCurrency } = useSwapDerivedState()
  const { openModal: openRwaConsentModal } = useRwaConsentModalState()

  const primaryFormValidation = useGetTradeFormValidation()
  const isPrimaryValidationPassed = useIsTradeFormValidationPassed()
  const tradeConfirmActions = useTradeConfirmActions()
  const { feeWarningAccepted } = useHighFeeWarning()
  const isNoImpactWarningAccepted = useIsNoImpactWarningAccepted()
  const localFormValidation = useSwapFormState()
  const wrappedToken = useWrappedToken()
  const onCurrencySelection = useOnCurrencySelection()
  const isCurrentTradeBridging = useIsCurrentTradeBridging()
  const shouldCheckBridgingRecipient = useShouldCheckBridgingRecipient()
  const smartContractRecipientConfirmed = useSmartContractRecipientConfirmed()
  const isSafeWallet = useIsSafeWallet()

  const { t } = useLingui()

  // Check RWA token status for consent modal
  const { status: rwaStatus, rwaTokenInfo } = useRwaTokenStatus({
    inputCurrency,
    outputCurrency,
  })

  const confirmTrade = useCallback(
    (forcePriceConfirmation?: boolean) => {
      // Show consent modal if country unknown and consent not given
      if (rwaStatus === RwaTokenStatus.RequiredConsent && rwaTokenInfo) {
        openRwaConsentModal({
          consentHash: rwaTokenInfo.consentHash,
          token: TokenWithLogo.fromToken(rwaTokenInfo.token),
        })
        return
      }

      tradeConfirmActions.onOpen(forcePriceConfirmation)
    },
    [rwaStatus, rwaTokenInfo, openRwaConsentModal, tradeConfirmActions],
  )

  const confirmText = isCurrentTradeBridging ? t`Swap and Bridge` : t`Swap`

  const { isPartialApproveEnabled } = useFeatureFlags()
  // enable partial approve only for swap
  const tradeFormButtonContext = useTradeFormButtonContext(confirmText, confirmTrade, !!isPartialApproveEnabled)

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

  const isDisabled =
    !isTradeContextReady ||
    !feeWarningAccepted ||
    !isNoImpactWarningAccepted ||
    (shouldCheckBridgingRecipient ? !smartContractRecipientConfirmed : false)

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
