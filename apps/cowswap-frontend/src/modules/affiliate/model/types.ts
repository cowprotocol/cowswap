import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { AffiliateProgramParams } from '../config/programParams'

/**
 * Flags how the referral modal was launched:
 * - 'ui': user clicked through our surfaces (header CTA, rewards hub, etc.)
 * - 'deeplink': modal auto-opened from a `?ref=` query
 */
export type ReferralModalSource = 'ui' | 'deeplink' | 'rewards'

/**
 * Categorises referral verification failures so UI copy can react:
 * - 'network': request failed or timed out
 * - 'rate-limit': backend rejected due to too many attempts
 * - 'unknown': any other error case we can't classify yet
 */
export type ReferralVerificationErrorType = 'network' | 'rate-limit' | 'unknown'
export type ReferralIncomingCodeReason = 'invalid' | 'expired' | 'ineligible'

/**
 * State machine describing the referral code lifecycle:
 * - 'idle': modal hasn't captured a code yet
 * - 'pending': code captured but we still need wallet/network before verifying
 * - 'checking': verification request in flight
 * - 'valid': backend accepted the code; `eligible` + `programActive` indicate next steps
 * - 'invalid': backend rejected the code
 * - 'expired': code used to be valid but is no longer eligible
 * - 'linked': wallet already bound to `linkedCode`
 * - 'ineligible': wallet can't use the code; optional `incomingCode` shows what triggered it
 * - 'error': verification failed; includes error type + message for UI feedback
 */
export type ReferralVerificationStatus =
  | { kind: 'idle' }
  | { kind: 'pending'; code: string }
  | { kind: 'checking'; code: string }
  | { kind: 'valid'; code: string; eligible: boolean; programActive: boolean; programParams?: AffiliateProgramParams }
  | { kind: 'invalid'; code: string }
  | { kind: 'expired'; code: string }
  | { kind: 'linked'; code: string; linkedCode: string }
  | { kind: 'ineligible'; code: string; reason: string; incomingCode?: string }
  | { kind: 'error'; code: string; errorType: ReferralVerificationErrorType; message: string }

/**
 * Represents the wallet's relationship with the referral program:
 * - 'unknown': we haven't fetched or inferred anything yet
 * - 'disconnected': user lacks a connected wallet
 * - 'unsupported': wallet network doesn't match supported IDs (optional `chainId` for display)
 * - 'eligible': wallet can bind the provided code
 * - 'linked': wallet already bound to the given `code`
 * - 'ineligible': wallet rejected with `reason`; may also expose an existing `linkedCode`
 */
export type WalletReferralState =
  | { status: 'unknown' }
  | { status: 'disconnected' }
  | { status: 'unsupported'; chainId?: SupportedChainId | number }
  | { status: 'eligible' }
  | { status: 'linked'; code: string }
  | { status: 'ineligible'; reason: string; linkedCode?: string }

export interface ReferralDomainState {
  modalOpen: boolean
  modalSource: ReferralModalSource | null
  editMode: boolean
  inputCode: string
  savedCode?: string
  incomingCode?: string
  incomingCodeReason?: ReferralIncomingCodeReason
  previousVerification?: ReferralVerificationStatus
  verification: ReferralVerificationStatus
  wallet: WalletReferralState
  shouldAutoVerify: boolean
  lastVerificationRequest?: {
    code: string
    timestamp: number
  }
  pendingVerificationRequest?: {
    id: number
    code?: string
  }
}

export interface ReferralApiConfig {
  baseUrl: string
  timeoutMs?: number
}

export interface ReferralVerificationRequest {
  code: string
  account: string
  chainId: SupportedChainId
}

/**
 * Shape returned by the referral verification endpoint:
 * - code: echoes the code with its validation status and program availability
 * - wallet: indicates referral eligibility plus any linked or rejection details
 */
export interface ReferralVerificationApiResponse {
  code: {
    value: string
    status: 'valid' | 'invalid' | 'expired'
    programActive: boolean
    params?: AffiliateProgramParams
  }
  wallet: {
    eligible: boolean
    linkedCode?: string
    ineligibleReason?: string
  }
}

export interface WalletReferralStatusRequest {
  account: string
}

export interface WalletReferralStatusResponse {
  wallet: {
    linkedCode?: string
    ineligibleReason?: string
  }
}

export interface ReferralCodeResponse {
  code: string
  traderRewardAmount?: number
  triggerVolume?: number
  timeCapDays?: number
  volumeCap?: number
}

export interface AffiliateCodeResponse {
  code: string
  rewardAmount: number
  triggerVolume: number
  timeCapDays: number
  volumeCap: number
  revenueSplitAffiliatePct: number
  revenueSplitTraderPct: number
  revenueSplitDaoPct: number
}

export interface AffiliateCreateRequest {
  code: string
  walletAddress: string
  signedMessage: string
}

export interface ReferralContextValue extends ReferralDomainState {
  cancelVerification: () => void
  actions: ReferralActions
}

export interface ReferralActions {
  openModal(source: ReferralModalSource, options?: { code?: string }): void
  closeModal(): void
  setInputCode(value: string): void
  enableEditMode(): void
  disableEditMode(): void
  saveCode(code: string): void
  removeCode(): void
  setIncomingCode(code?: string): void
  setIncomingCodeReason(reason?: ReferralIncomingCodeReason): void
  setWalletState(state: WalletReferralState): void
  startVerification(code: string): void
  completeVerification(status: ReferralVerificationStatus): void
  setShouldAutoVerify(value: boolean): void
  setSavedCode(code?: string): void
  requestVerification(code?: string): void
  clearPendingVerification(id: number): void
  registerCancelVerification(handler: () => void): void
}
