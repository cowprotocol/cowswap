import { FormEvent, ReactNode, RefObject } from 'react'

import { TraderReferralCodeModalUiState } from '../../model/hooks/useTraderReferralCodeModalState'
import { TraderReferralCodeVerificationStatus } from '../../model/partner-trader-types'

export type FocusableElement = HTMLElement | HTMLInputElement | HTMLButtonElement | null

export interface PrimaryCta {
  label: string
  disabled: boolean
  action: 'none' | 'verify' | 'viewRewards' | 'goBack'
}

export interface TraderReferralCodeModalContentProps {
  uiState: TraderReferralCodeModalUiState
  isConnected: boolean
  savedCode?: string
  displayCode: string
  verification: TraderReferralCodeVerificationStatus
  incomingIneligibleCode?: string
  onPrimaryClick(): void
  onEdit(): void
  onRemove(): void
  onSave(): void
  onChange(event: FormEvent<HTMLInputElement>): void
  primaryCta: PrimaryCta
  linkedMessage: ReactNode
  hasRejection: boolean
  infoMessage: string
  shouldShowInfo: boolean
  inputRef: RefObject<HTMLInputElement | null>
  ctaRef: RefObject<HTMLButtonElement | null>
  onDismiss(): void
}

export interface StatusCopyResult {
  shouldShowInfo: boolean
  infoMessage: string
}
