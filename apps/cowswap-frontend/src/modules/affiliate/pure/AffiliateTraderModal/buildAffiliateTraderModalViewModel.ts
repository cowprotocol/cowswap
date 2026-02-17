import { FormEvent } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

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
  const { savedCode, verification, incomingCode, incomingCodeReason } = traderReferralCode
  const hasRejection = Boolean(incomingCodeReason)

  return {
    hasRejection,
    subtitle: buildSubtitleSection({
      uiState,
      hasRejection,
      verification,
      incomingCode,
      savedCode,
      displayCode,
      incomingCodeReason,
      isConnected: !!account,
    }),
    status: buildStatusSection(verification, walletStatus),
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
  verification: AffiliateTraderModalState['verification']
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
    verification: params.verification,
    onEdit: params.onEdit,
    onRemove: params.onRemove,
    onSave: params.onSave,
    onChange: params.onChange,
  }
}

function buildSubtitleSection(params: {
  uiState: AffiliateTraderModalState['uiState']
  hasRejection: boolean
  verification: AffiliateTraderModalState['verification']
  incomingCode?: string
  savedCode?: string
  displayCode: string
  incomingCodeReason?: AffiliateTraderModalState['incomingCodeReason']
  isConnected: boolean
}): ModalViewModel['subtitle'] {
  const { uiState, hasRejection, verification, incomingCode, savedCode, displayCode, incomingCodeReason, isConnected } =
    params
  const verificationCode = 'code' in verification ? verification.code : undefined
  const codeForDisplay = incomingCode || verificationCode || savedCode || displayCode

  return {
    uiState,
    hasRejection,
    verification,
    incomingIneligibleCode: incomingCode || (verification.kind === 'ineligible' ? verification.code : undefined),
    isConnected,
    rejectionCode: hasRejection ? codeForDisplay : undefined,
    rejectionReason: incomingCodeReason,
    isLinked: uiState === 'linked',
  }
}

function buildStatusSection(
  verification: AffiliateTraderModalState['verification'],
  walletStatus: AffiliateTraderModalState['walletStatus'],
): ModalViewModel['status'] {
  const timeCapDays = verification.kind === 'valid' ? verification.programParams?.timeCapDays : undefined
  const eligibilityUnknown = walletStatus === 'eligibility-unknown'
  const eligibilityCheckIsLoading = walletStatus === 'unknown'
  const statusCopy = getStatusCopy(verification, timeCapDays, eligibilityUnknown)

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
