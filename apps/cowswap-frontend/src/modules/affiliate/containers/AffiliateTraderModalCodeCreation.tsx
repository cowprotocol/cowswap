/* eslint-disable complexity */
/* eslint-disable max-lines-per-function */
import { useAtomValue } from 'jotai'
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import EARN_AS_TRADER_ILLUSTRATION from '@cowprotocol/assets/images/earn-as-trader.svg'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { ButtonPrimary } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletChainId } from '@cowprotocol/wallet-provider'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import { useToggleWalletModal } from 'legacy/state/application/hooks'

import { Routes } from 'common/constants/routes'
import { useNavigate } from 'common/hooks/useNavigate'

import {
  usePayoutAddressConfirmation,
  useTraderReferralCodeHandlers,
} from '../hooks/useAffiliateTraderModalCodeCreation.helpers'
import { useAffiliateTraderVerification } from '../hooks/useAffiliateTraderVerification'
import { TraderWalletStatus, useAffiliateTraderWallet } from '../hooks/useAffiliateTraderWallet'
import { useToggleAffiliateModal } from '../hooks/useToggleAffiliateModal'
import { formatRefCode } from '../lib/affiliateProgramUtils'
import {
  TraderReferralCodeCodeCreationUiState,
  TraderReferralCodeFormSectionProps,
} from '../pure/AffiliateTraderModal/AffiliateTraderModal.types'
import { CodeCreationPayoutSection } from '../pure/AffiliateTraderModal/CodeCreationPayoutSection'
import { CodeCreationStatusSection } from '../pure/AffiliateTraderModal/CodeCreationStatusSection'
import { CodeCreationSubtitle } from '../pure/AffiliateTraderModal/CodeCreationSubtitle'
import { Body, Footer, Title } from '../pure/AffiliateTraderModal/styles'
import { TraderReferralCodeForm } from '../pure/AffiliateTraderModal/TraderReferralCodeForm'
import { StatusText } from '../pure/shared'
import { AffiliateTraderAtom, affiliateTraderAtom } from '../state/affiliateTraderAtom'

type CodeCreationModalState = AffiliateTraderAtom & {
  walletStatus: TraderWalletStatus
  codeCreationUiState: TraderReferralCodeCodeCreationUiState
}

function trackConnectToVerifyClick(toggleWalletModal: () => void, analytics: ReturnType<typeof useCowAnalytics>): void {
  toggleWalletModal()
  analytics.sendEvent({ category: 'affiliate', action: 'cta_clicked', label: 'connect_to_verify' })
}

function trackViewRewardsClick(
  analytics: ReturnType<typeof useCowAnalytics>,
  toggleAffiliateModal: () => void,
  navigate: ReturnType<typeof useNavigate>,
): void {
  analytics.sendEvent({ category: 'affiliate', action: 'cta_clicked', label: 'view_rewards' })
  toggleAffiliateModal()
  navigate(Routes.ACCOUNT_AFFILIATE_TRADER)
}

export function AffiliateTraderModalCodeCreation(): ReactNode {
  const affiliateTrader = useAtomValue(affiliateTraderAtom)
  const { account } = useWalletInfo()
  const chainId = useWalletChainId()
  const { walletStatus } = useAffiliateTraderWallet()
  const supportedNetwork = walletStatus !== TraderWalletStatus.UNSUPPORTED
  const traderReferralCode = useMemo<CodeCreationModalState>(() => {
    const hasCode = Boolean(affiliateTrader.codeInput || affiliateTrader.savedCode)
    const codeCreationUiState =
      affiliateTrader.verificationStatus === 'checking'
        ? 'checking'
        : affiliateTrader.verificationStatus === 'invalid'
          ? 'invalid'
          : affiliateTrader.verificationStatus === 'valid'
            ? 'valid'
            : affiliateTrader.verificationStatus === 'error'
              ? 'error'
              : affiliateTrader.verificationStatus === 'pending'
                ? 'pending'
                : hasCode
                  ? 'pending'
                  : 'empty'

    return {
      ...affiliateTrader,
      walletStatus,
      codeCreationUiState,
    }
  }, [affiliateTrader, walletStatus])
  const inputRef = useRef<HTMLInputElement | null>(null)
  const handlers = useTraderReferralCodeHandlers(inputRef)
  const { onEdit: sharedOnEdit, onRemove: sharedOnRemove, onSave: sharedOnSave } = handlers
  const [isEditMode, setIsEditMode] = useState(false)
  const hasCode = Boolean(traderReferralCode.codeInput || traderReferralCode.savedCode)
  const uiState = useMemo(
    () => (isEditMode && hasCode ? 'editing' : traderReferralCode.codeCreationUiState),
    [hasCode, isEditMode, traderReferralCode.codeCreationUiState],
  )
  const onEdit = useCallback(() => {
    setIsEditMode(true)
    sharedOnEdit()
  }, [sharedOnEdit])
  const onRemove = useCallback(() => {
    setIsEditMode(false)
    sharedOnRemove()
  }, [sharedOnRemove])
  const onSave = useCallback(() => {
    setIsEditMode(false)
    sharedOnSave()
  }, [sharedOnSave])
  useEffect(() => {
    if (!traderReferralCode.modalOpen) {
      setIsEditMode(false)
      return
    }

    setIsEditMode(!traderReferralCode.savedCode && hasCode)
  }, [hasCode, traderReferralCode.modalOpen, traderReferralCode.savedCode])
  const { payoutAddressConfirmed, togglePayoutAddressConfirmed } = usePayoutAddressConfirmation(account)
  const displayCode = traderReferralCode.codeInput
  const savedCode = traderReferralCode.savedCode
  useEffect(() => {
    if (!traderReferralCode.modalOpen) {
      return
    }

    if (uiState === 'invalid' || uiState === 'editing' || uiState === 'empty') {
      inputRef.current?.focus()
    }
  }, [inputRef, traderReferralCode.modalOpen, uiState])
  const verificationStatus = traderReferralCode.verificationStatus
  const verificationProgramParams = traderReferralCode.verificationProgramParams
  const verificationErrorMessage = traderReferralCode.verificationErrorMessage
  const verificationEligible = traderReferralCode.verificationEligible
  const analytics = useCowAnalytics()
  const navigate = useNavigate()
  const toggleAffiliateModal = useToggleAffiliateModal()
  const toggleWalletModal = useToggleWalletModal()
  const { runVerification, cancelVerification } = useAffiliateTraderVerification({
    account,
    chainId,
    supportedNetwork,
    traderReferralCode,
    analytics,
    toggleWalletModal,
  })
  useEffect(() => {
    return () => cancelVerification()
  }, [cancelVerification])
  const isConnected = !!account
  const onConnectToVerify = (): void => trackConnectToVerifyClick(toggleWalletModal, analytics)
  const onViewRewards = (): void => trackViewRewardsClick(analytics, toggleAffiliateModal, navigate)
  const programParams = verificationStatus === 'valid' ? verificationProgramParams : undefined
  const rewardAmount = programParams?.traderRewardAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })
  const triggerVolume = programParams?.triggerVolumeUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })
  const timeCapDays = programParams?.timeCapDays
  const hasProgramDetails = Boolean(programParams && rewardAmount && triggerVolume && timeCapDays)
  const hasEnteredCode = Boolean(displayCode || savedCode)
  const hasValidLength = Boolean(formatRefCode(displayCode))
  const disabledByInput = !hasEnteredCode || !hasValidLength
  const blockedByPayoutConfirmation =
    !!account && chainId !== undefined && chainId !== SupportedChainId.MAINNET && !payoutAddressConfirmed
  const disabledByAction = disabledByInput || blockedByPayoutConfirmation
  const disabledStateLabelByUiState: Partial<Record<TraderReferralCodeFormSectionProps['uiState'], string>> = {
    checking: t`Checking code…`,
    invalid: t`This code is invalid. Try another.`,
    empty: t`Provide a valid referral code`,
  }
  const disabledStateLabel = disabledStateLabelByUiState[uiState]
  const resolvedVerificationErrorMessage =
    verificationStatus === 'error' ? (verificationErrorMessage ?? t`Unable to verify code`) : undefined

  return (
    <>
      <Body>
        <img src={EARN_AS_TRADER_ILLUSTRATION} alt="" role="presentation" />
        <Title>
          <Trans>Enter referral code</Trans>
        </Title>
        <CodeCreationSubtitle
          hasProgramDetails={hasProgramDetails}
          isConnected={isConnected}
          rewardAmount={rewardAmount}
          triggerVolume={triggerVolume}
          timeCapDays={timeCapDays}
        />
        <TraderReferralCodeForm
          uiState={uiState}
          isConnected={isConnected}
          savedCode={savedCode}
          displayCode={displayCode}
          verificationStatus={verificationStatus}
          onEdit={onEdit}
          onRemove={onRemove}
          onSave={onSave}
          onChange={handlers.onChange}
          onPrimaryClick={
            disabledStateLabel !== undefined
              ? onSave
              : uiState === 'editing'
                ? onSave
                : uiState === 'error' || uiState === 'pending'
                  ? isConnected
                    ? () => runVerification(displayCode)
                    : onConnectToVerify
                  : uiState === 'valid'
                    ? onViewRewards
                    : onSave
          }
          inputRef={inputRef}
        />
        {resolvedVerificationErrorMessage && (
          <StatusText $variant="error">{resolvedVerificationErrorMessage}</StatusText>
        )}
        <CodeCreationStatusSection
          walletStatus={walletStatus}
          verificationStatus={verificationStatus}
          verificationProgramParams={verificationProgramParams}
          verificationEligible={verificationEligible}
        />
        <CodeCreationPayoutSection
          account={account}
          chainId={chainId}
          payoutAddressConfirmed={payoutAddressConfirmed}
          onTogglePayoutAddressConfirmed={togglePayoutAddressConfirmed}
        />
      </Body>
      <Footer>
        {disabledStateLabel !== undefined ? (
          <ButtonPrimary disabled={true} onClick={onSave} type="button">
            {disabledStateLabel}
          </ButtonPrimary>
        ) : uiState === 'editing' ? (
          <ButtonPrimary disabled={disabledByAction} onClick={onSave} type="button">
            {hasEnteredCode && hasValidLength
              ? t`Save and verify code`
              : t`Enter a referral code with 5 to 20 characters`}
          </ButtonPrimary>
        ) : uiState === 'error' || uiState === 'pending' ? (
          <ButtonPrimary
            disabled={disabledByAction}
            onClick={isConnected ? () => runVerification(displayCode) : onConnectToVerify}
            type="button"
          >
            {isConnected ? t`Verify code` : t`Connect to verify code`}
          </ButtonPrimary>
        ) : uiState === 'valid' ? (
          <ButtonPrimary disabled={false} onClick={onViewRewards} type="button">
            {t`View rewards`}
          </ButtonPrimary>
        ) : (
          <ButtonPrimary disabled={disabledByInput} onClick={onSave} type="button">
            {t`Save and verify code`}
          </ButtonPrimary>
        )}
      </Footer>
    </>
  )
}
