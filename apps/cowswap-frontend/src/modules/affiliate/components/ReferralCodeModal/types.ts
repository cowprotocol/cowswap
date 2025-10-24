import { FormEvent, RefObject } from 'react'

import { ReferralModalUiState } from '../../hooks/useReferralModalState'
import { ReferralVerificationStatus } from '../../types'

export type FocusableElement = HTMLElement | HTMLInputElement | HTMLButtonElement | null

export interface PrimaryCta {
  label: string
  disabled: boolean
  action: 'none' | 'verify' | 'viewRewards' | 'goBack'
}

export interface ReferralModalContentProps {
  uiState: ReferralModalUiState
  savedCode?: string
  displayCode: string
  verification: ReferralVerificationStatus
  onPrimaryClick(): void
  onEdit(): void
  onRemove(): void
  onSave(): void
  onChange(event: FormEvent<HTMLInputElement>): void
  helperText?: string
  primaryCta: PrimaryCta
  errorMessage?: string
  invalidMessage: string
  expiredMessage: string
  linkedMessage: string
  ineligibleMessage: string
  infoMessage: string
  shouldShowInfo: boolean
  inputRef: RefObject<HTMLInputElement | null>
  ctaRef: RefObject<HTMLButtonElement | null>
  onDismiss(): void
}

export interface StatusCopyResult {
  shouldShowInfo: boolean
  infoMessage: string
  expiredMessage: string
  invalidMessage: string
  errorMessage?: string
}
