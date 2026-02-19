export interface AffiliateProgramParams {
  traderRewardAmount: number
  triggerVolumeUsd: number // TODO rename to triggerVolume
  timeCapDays: number
  volumeCapUsd: number
}

export interface TraderReferralCodeApiConfig {
  baseUrl: string
  timeoutMs?: number
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
