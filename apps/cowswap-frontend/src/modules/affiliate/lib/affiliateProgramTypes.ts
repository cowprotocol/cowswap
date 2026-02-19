import { SupportedChainId } from '@cowprotocol/cow-sdk'

/**
 * Categorises referral verification failures so UI copy can react:
 * - 'network': request failed or timed out
 * - 'unknown': any other error case we can't classify yet
 */
export type TraderReferralCodeVerificationErrorType = 'network' | 'unknown'

/**
 * Flat verification status used by UI state.
 */
export type TraderReferralCodeVerificationStatus = 'idle' | 'pending' | 'checking' | 'valid' | 'invalid' | 'error'

/**
 * Verification result payload returned from API flows before flattening to UI state.
 */
export type TraderReferralCodeVerificationResult =
  | { kind: 'idle' }
  | { kind: 'pending'; code: string }
  | { kind: 'checking'; code: string }
  | { kind: 'valid'; code: string; eligible: boolean; programParams?: AffiliateProgramParams }
  | { kind: 'invalid'; code: string }
  | { kind: 'error'; code: string; errorType: TraderReferralCodeVerificationErrorType; message: string }

/**
 * Represents the wallet's relationship with the referral program:
 * - 'unknown': we haven't fetched or inferred anything yet
 * - 'disconnected': user lacks a connected wallet
 * - 'unsupported': wallet network doesn't match supported IDs (optional `chainId` for display)
 * - 'eligible': wallet can bind the provided code
 * - 'linked': wallet already bound to the given `code`
 * - 'ineligible': wallet rejected with `reason`; may also expose an existing `linkedCode`
 * - 'eligibility-unknown': wallet history could not be verified; optional `reason` for UI copy
 */
export type TraderWalletReferralCodeState =
  | { status: 'unknown' }
  | { status: 'disconnected' }
  | { status: 'unsupported'; chainId?: SupportedChainId | number }
  | { status: 'eligible' }
  | { status: 'linked'; code: string }
  | { status: 'ineligible'; reason: string; linkedCode?: string }
  | { status: 'eligibility-unknown'; reason?: string }

export interface AffiliateTraderState {
  modalOpen: boolean
  code: string
  codeOrigin: 'none' | 'url' | 'stored' | 'manual'
  verificationStatus: TraderReferralCodeVerificationStatus
  verificationEligible?: boolean
  verificationProgramParams?: AffiliateProgramParams
  verificationErrorMessage?: string
}

export type AffiliateProgramParams = {
  traderRewardAmount: number
  triggerVolumeUsd: number
  timeCapDays: number
  volumeCapUsd: number
}

export interface TraderReferralCodeApiConfig {
  baseUrl: string
  timeoutMs?: number
}

export interface TraderReferralCodeVerificationRequest {
  code: string
}

export interface TraderReferralCodeVerificationResponse {
  status: number
  ok: boolean
  data?: TraderReferralCodeResponse
  text: string
}

export interface TraderWalletReferralCodeStatusRequest {
  account: string
}

export interface TraderWalletReferralCodeStatusResponse {
  wallet: {
    linkedCode?: string
    ineligibleReason?: string
  }
}

export interface TraderReferralCodeResponse {
  code: string
  traderRewardAmount?: number
  triggerVolume?: number
  timeCapDays?: number
  volumeCap?: number
}

export interface PartnerInfoResponse {
  code: string
  createdAt: string
  rewardAmount: number
  triggerVolume: number
  timeCapDays: number
  volumeCap: number
  revenueSplitAffiliatePct: number
  revenueSplitTraderPct: number
  revenueSplitDaoPct: number
}

export interface TraderStatsResponse {
  trader_address: string
  bound_referrer_code: string
  linked_since: string
  rewards_end: string
  eligible_volume: number
  left_to_next_rewards: number
  trigger_volume: number
  total_earned: number
  paid_out: number
  next_payout: number
  lastUpdatedAt: string
}

export interface TraderActivityRow {
  date: string
  chainId: SupportedChainId
  chainName: string
  orderUid: string
  txHash?: string
  sellToken: string
  buyToken: string
  sellAmount: string
  buyAmount: string
  feeAmount?: string
  feeToken?: string
  status: string
  referrerCode?: string
  isEligible: boolean
  ineligibleReason?: string
}

export type AffiliatePayoutHistoryRole = 'affiliate' | 'trader'

export interface PayoutHistoryRow {
  date: string
  amount: string
  txHash: string
  chainId: SupportedChainId
}

export interface PartnerStatsResponse {
  affiliate_address: string
  referrer_code: string
  total_volume: number
  trigger_volume: number
  total_earned: number
  paid_out: number
  next_payout: number
  left_to_next_reward: number
  active_traders: number
  total_traders: number
  lastUpdatedAt: string
}

export interface PartnerCreateRequest {
  code: string
  walletAddress: string
  signedMessage: string
}
