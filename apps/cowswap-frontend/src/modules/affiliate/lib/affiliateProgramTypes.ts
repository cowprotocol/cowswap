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
  data?: TraderInfoResponse
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

export interface TraderInfoResponse {
  code: string
  traderRewardAmount: number
  triggerVolume: number
  timeCapDays: number
  volumeCap: number
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
