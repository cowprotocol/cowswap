import { FormEvent, RefObject } from 'react'

import { StatusColorVariant } from '@cowprotocol/ui'

import { TraderReferralCodeModalUiState } from '../../hooks/useAffiliateTraderModalState'
import { AffiliateProgramParams, TraderReferralCodeVerificationStatus } from '../../lib/affiliateProgramTypes'

export type FocusableElement = HTMLElement | HTMLInputElement | HTMLButtonElement | null

export interface PrimaryCta {
  label: string
  disabled: boolean
  action: 'none' | 'save' | 'verify' | 'viewRewards' | 'goBack'
}

export interface TraderReferralCodeModalContentProps {
  uiState: TraderReferralCodeModalUiState
  hasRejection: boolean
  subtitle: TraderReferralCodeSubtitleProps
  form: TraderReferralCodeFormSectionProps
  status: TraderReferralCodeStatusSectionProps
  payout: TraderReferralCodePayoutSectionProps
  primaryCta: PrimaryCta
  onPrimaryClick(): void
  ctaRef: RefObject<HTMLButtonElement | null>
  onDismiss(): void
}

export interface TraderReferralCodeSubtitleProps {
  uiState: TraderReferralCodeModalUiState
  hasRejection: boolean
  verificationStatus: TraderReferralCodeVerificationStatus
  verificationProgramParams?: AffiliateProgramParams
  verificationErrorMessage?: string
  refCode?: string
  isConnected: boolean
  rejectionCode?: string
  isLinked: boolean
}

export interface TraderReferralCodeFormSectionProps {
  isVisible: boolean
  uiState: TraderReferralCodeModalUiState
  isConnected: boolean
  savedCode?: string
  displayCode: string
  verificationStatus: TraderReferralCodeVerificationStatus
  onEdit(): void
  onRemove(): void
  onSave(): void
  onChange(event: FormEvent<HTMLInputElement>): void
  inputRef: RefObject<HTMLInputElement | null>
}

export interface TraderReferralCodeStatusSectionProps {
  infoMessage: string
  shouldShowInfo: boolean
  infoVariant: StatusColorVariant
}

export interface TraderReferralCodePayoutSectionProps {
  showPayoutAddressConfirmation: boolean
  payoutAddress?: string
  payoutAddressConfirmed: boolean
  onTogglePayoutAddressConfirmed(checked: boolean): void
}

export interface StatusCopyResult {
  shouldShowInfo: boolean
  infoMessage: string
  variant: StatusColorVariant
}
