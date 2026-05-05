import type { SupportedChainId } from '@cowprotocol/cow-sdk'

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

export type TraderActivityEligibilityReason =
  | 'eligible'
  | 'code_mismatch_after_binding'
  | 'code_not_found'
  | 'integrator_ignored'
  | 'low_fee_excluded'
  | 'ref_after_first_trade'
  | 'volume_cap_reached'

export interface TraderActivityResponse {
  rows: TraderActivityRowResponse[]
  lastUpdatedAt: string
}

export interface TraderActivityRowResponse {
  chain_id: SupportedChainId
  creation_date: string
  tx_hash: string
  order_uid: string
  trader_address: string
  sell_token: string
  buy_token: string
  sell_token_symbol?: string
  buy_token_symbol?: string
  executed_sell_amount: string
  executed_buy_amount: string
  usd_value: number
  eligible_volume_usd: number
  referrer_code: string
  bound_referrer_code: string
  eligibility_reason: TraderActivityEligibilityReason
  is_bound_to_code: boolean
  is_eligible: boolean
}
