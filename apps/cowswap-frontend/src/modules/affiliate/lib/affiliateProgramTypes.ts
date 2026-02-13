import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { PartnerProgramParams } from './affiliateProgramUtils'

/**
 * Categorises referral verification failures so UI copy can react:
 * - 'network': request failed or timed out
 * - 'unknown': any other error case we can't classify yet
 */
export type TraderReferralCodeVerificationErrorType = 'network' | 'unknown'
export type TraderReferralCodeIncomingReason = 'invalid' | 'ineligible'

/**
 * State machine describing the referral code lifecycle:
 * - 'idle': modal hasn't captured a code yet
 * - 'pending': code captured but we still need wallet/network before verifying
 * - 'checking': verification request in flight
 * - 'valid': backend accepted the code; `eligible` indicates next steps
 * - 'invalid': backend rejected the code
 * - 'linked': wallet already bound to `linkedCode`
 * - 'ineligible': wallet can't use the code; optional `incomingCode` shows what triggered it
 * - 'error': verification failed; includes error type + message for UI feedback
 */
export type TraderReferralCodeVerificationStatus =
  | { kind: 'idle' }
  | { kind: 'pending'; code: string }
  | { kind: 'checking'; code: string }
  | { kind: 'valid'; code: string; eligible: boolean; programParams?: PartnerProgramParams }
  | { kind: 'invalid'; code: string }
  | { kind: 'linked'; code: string; linkedCode: string }
  | { kind: 'ineligible'; code: string; reason: string; incomingCode?: string }
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
  editMode: boolean
  inputCode: string
  incomingCode?: string
  incomingCodeReason?: TraderReferralCodeIncomingReason
  verification: TraderReferralCodeVerificationStatus
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

export interface PartnerCodeResponse {
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
