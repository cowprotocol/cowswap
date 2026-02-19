import { FormEvent } from 'react'

import { StatusColorVariant } from '@cowprotocol/ui'

import { AffiliateProgramParams } from '../../lib/affiliateProgramTypes'

import type { TraderReferralCodeVerificationStatus } from '../../hooks/useAffiliateTraderVerification'

export type TraderReferralCodeCodeCreationUiState =
  | 'empty'
  | 'editing'
  | 'pending'
  | 'checking'
  | 'invalid'
  | 'valid'
  | 'error'

export type FocusableElement = HTMLElement | HTMLInputElement | HTMLButtonElement | null

export interface TraderReferralCodeFormSectionProps {
  isVisible: boolean
  uiState: TraderReferralCodeCodeCreationUiState
  isConnected: boolean
  savedCode?: string
  displayCode: string
  verificationStatus: TraderReferralCodeVerificationStatus
  onEdit(): void
  onRemove(): void
  onSave(): void
  onChange(event: FormEvent<HTMLInputElement>): void
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

export interface AffiliateTraderModalCodeCreationViewModel {
  uiState: TraderReferralCodeCodeCreationUiState
  verificationStatus: TraderReferralCodeVerificationStatus
  verificationProgramParams?: AffiliateProgramParams
  verificationErrorMessage?: string
  isConnected: boolean
  form: TraderReferralCodeFormSectionProps
  status: TraderReferralCodeStatusSectionProps
  payout: TraderReferralCodePayoutSectionProps
  onConnectWallet(): void
}

export interface AffiliateTraderModalCodeInfoViewModel {
  uiState: 'valid'
  verificationStatus: TraderReferralCodeVerificationStatus
  verificationProgramParams?: AffiliateProgramParams
  isConnected: boolean
  status: TraderReferralCodeStatusSectionProps
  onViewRewards(): void
}

export interface AffiliateTraderModalIneligibleViewModel {
  refCode?: string
  onClose(): void
}

export interface AffiliateTraderModalUnsupportedViewModel {
  isConnected: boolean
}
