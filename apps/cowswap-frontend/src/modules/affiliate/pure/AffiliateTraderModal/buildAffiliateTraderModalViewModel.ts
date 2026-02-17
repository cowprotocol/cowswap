import { FormEvent } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { t } from '@lingui/core/macro'

import { TraderReferralCodeModalContentProps } from './AffiliateTraderModal.types'
import { getStatusCopy } from './traderReferralCodeModal.helpers'

import { AffiliateTraderModalState } from '../../hooks/useAffiliateTraderModalState'

interface BuildAffiliateTraderModalViewModelParams {
  modalState: AffiliateTraderModalState
  account?: string
  chainId?: number
  payoutAddressConfirmed: boolean
  onTogglePayoutAddressConfirmed(checked: boolean): void
}

type ModalViewModel = Pick<TraderReferralCodeModalContentProps, 'hasRejection' | 'subtitle' | 'status' | 'payout'>

type FormViewModel = Omit<TraderReferralCodeModalContentProps['form'], 'inputRef'>

export function buildAffiliateTraderModalViewModel(params: BuildAffiliateTraderModalViewModelParams): ModalViewModel {
  const { modalState, account, chainId, payoutAddressConfirmed } = params
  const { uiState, displayCode, walletStatus, ...traderReferralCode } = modalState
  const {
    savedCode,
    verificationStatus,
    verificationEligible,
    verificationProgramParams,
    verificationErrorMessage,
  } = traderReferralCode
  const hasRejection = false

  return {
    hasRejection,
    subtitle: buildSubtitleSection({
      uiState,
      hasRejection,
      verificationStatus,
      verificationProgramParams,
      verificationErrorMessage,
      savedCode,
      displayCode,
      isConnected: !!account,
    }),
    status: buildStatusSection(verificationStatus, verificationProgramParams, verificationEligible, walletStatus),
    payout: {
      showPayoutAddressConfirmation: !!account && chainId !== undefined && chainId !== SupportedChainId.MAINNET,
      payoutAddress: account,
      payoutAddressConfirmed,
      onTogglePayoutAddressConfirmed: params.onTogglePayoutAddressConfirmed,
    },
  }
}

export function buildFormViewModel(params: {
  uiState: AffiliateTraderModalState['uiState']
  isConnected: boolean
  savedCode?: string
  displayCode: string
  verificationStatus: AffiliateTraderModalState['verificationStatus']
  onEdit(): void
  onRemove(): void
  onSave(): void
  onChange(event: FormEvent<HTMLInputElement>): void
}): FormViewModel {
  return {
    isVisible: params.uiState !== 'ineligible',
    uiState: params.uiState,
    isConnected: params.isConnected,
    savedCode: params.savedCode,
    displayCode: params.displayCode,
    verificationStatus: params.verificationStatus,
    onEdit: params.onEdit,
    onRemove: params.onRemove,
    onSave: params.onSave,
    onChange: params.onChange,
  }
}

function buildSubtitleSection(params: {
  uiState: AffiliateTraderModalState['uiState']
  hasRejection: boolean
  verificationStatus: AffiliateTraderModalState['verificationStatus']
  verificationProgramParams?: AffiliateTraderModalState['verificationProgramParams']
  verificationErrorMessage?: AffiliateTraderModalState['verificationErrorMessage']
  savedCode?: string
  displayCode: string
  isConnected: boolean
}): ModalViewModel['subtitle'] {
  const {
    uiState,
    hasRejection,
    verificationStatus,
    verificationProgramParams,
    verificationErrorMessage: rawVerificationErrorMessage,
    savedCode,
    displayCode,
    isConnected,
  } = params
  const codeForDisplay = savedCode || displayCode

  return {
    uiState,
    hasRejection,
    verificationStatus,
    verificationProgramParams,
    verificationErrorMessage:
      uiState === 'error' && verificationStatus === 'error'
        ? (rawVerificationErrorMessage ?? t`Unable to verify code`)
        : undefined,
    refCode: verificationStatus === 'ineligible' ? codeForDisplay : undefined,
    isConnected,
    rejectionCode: undefined,
    isLinked: uiState === 'linked',
  }
}

function buildStatusSection(
  verificationStatus: AffiliateTraderModalState['verificationStatus'],
  verificationProgramParams: AffiliateTraderModalState['verificationProgramParams'],
  verificationEligible: AffiliateTraderModalState['verificationEligible'],
  walletStatus: AffiliateTraderModalState['walletStatus'],
): ModalViewModel['status'] {
  const timeCapDays = verificationStatus === 'valid' ? verificationProgramParams?.timeCapDays : undefined
  const eligibilityUnknown = walletStatus === 'eligibility-unknown'
  const eligibilityCheckIsLoading = walletStatus === 'unknown'
  const statusCopy = getStatusCopy(verificationStatus, verificationEligible, timeCapDays, eligibilityUnknown)

  return eligibilityUnknown || !eligibilityCheckIsLoading
    ? {
        infoMessage: statusCopy.infoMessage,
        shouldShowInfo: statusCopy.shouldShowInfo,
        infoVariant: statusCopy.variant,
      }
    : {
        infoMessage: statusCopy.infoMessage,
        shouldShowInfo: false,
        infoVariant: statusCopy.variant,
      }
}
