import React, { ReactNode, useCallback, useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useGeoStatus } from 'modules/rwa/hooks/useGeoStatus'
import { useRwaConsentModalState } from 'modules/rwa/hooks/useRwaConsentModalState'
import { useRwaConsentStatus } from 'modules/rwa/hooks/useRwaConsentStatus'
import { getRwaTokenInfo } from 'modules/rwa/utils/getRwaTokenInfo'
import { useLingui } from '@lingui/react/macro'

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
  const { account } = useWalletInfo()
  const geoStatus = useGeoStatus()
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

  const { t } = useLingui()

  const rwaTokenInfo = useMemo(() => {
    const inputRwaInfo = getRwaTokenInfo(inputCurrency)
    const outputRwaInfo = getRwaTokenInfo(outputCurrency)
    return inputRwaInfo || outputRwaInfo
  }, [inputCurrency, outputCurrency])

  const rwaConsentKey = useMemo(
    () =>
      rwaTokenInfo && account
        ? {
            wallet: account,
            issuer: rwaTokenInfo.issuer,
            tosVersion: rwaTokenInfo.tosVersion,
          }
        : { wallet: '', issuer: '', tosVersion: '' },
    [rwaTokenInfo, account],
  )

  const rwaConsentStatus = useRwaConsentStatus(rwaConsentKey)
  const consentStatus = rwaConsentStatus.consentStatus

  const confirmTrade = useCallback(
    (forcePriceConfirmation?: boolean) => {
      const needsRwaConsent =
        rwaTokenInfo &&
        geoStatus === 'UNKNOWN' &&
        consentStatus !== 'valid'

      if (needsRwaConsent) {
        openRwaConsentModal({
          issuer: rwaTokenInfo.issuer,
          tosVersion: rwaTokenInfo.tosVersion,
          issuerName: rwaTokenInfo.issuerName,
        })
        return
      }

      tradeConfirmActions.onOpen(forcePriceConfirmation)
    },
    [rwaTokenInfo, geoStatus, consentStatus, openRwaConsentModal, tradeConfirmActions],
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
  })

  const shouldShowAddIntermediateToken =
    tokenToBeImported &&
    !!intermediateBuyToken &&
    primaryFormValidation === TradeFormValidation.ImportingIntermediateToken

  const isDisabled = !isTradeContextReady || !feeWarningAccepted || !isNoImpactWarningAccepted

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
