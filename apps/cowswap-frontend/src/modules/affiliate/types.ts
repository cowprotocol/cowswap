import { SupportedChainId } from '@cowprotocol/cow-sdk'

export type ReferralModalSource = 'header' | 'rewards' | 'deeplink'

export type ReferralVerificationErrorType = 'network' | 'rate-limit' | 'unknown'
export type ReferralIncomingCodeReason = 'invalid' | 'expired' | 'ineligible'

export type ReferralVerificationStatus =
  | { kind: 'idle' }
  | { kind: 'pending'; code: string }
  | { kind: 'checking'; code: string }
  | { kind: 'valid'; code: string; eligible: boolean; programActive: boolean }
  | { kind: 'invalid'; code: string }
  | { kind: 'expired'; code: string }
  | { kind: 'linked'; code: string; linkedCode: string }
  | { kind: 'ineligible'; code: string; reason: string; incomingCode?: string }
  | { kind: 'error'; code: string; errorType: ReferralVerificationErrorType; message: string }

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

export interface ReferralVerificationApiResponse {
  code: {
    value: string
    status: 'valid' | 'invalid' | 'expired'
    programActive: boolean
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
