export enum TwapDemandAnalyticsEvent {
  UNSUPPORTED_WALLET_SHOWN = 'twap_unsupported_wallet_shown',
  SETUP_LINK_CLICK = 'twap_setup_link_click',
  SAFE_WC_BANNER_SHOWN = 'twap_safe_wc_banner_shown',
  SAFE_WC_BANNER_CLICK = 'twap_safe_wc_banner_click',
  INTEREST_CLICK = 'twap_interest_click',
  TAB_OPENED = 'twap_tab_opened',
}

export enum TwapDemandWalletType {
  EOA = 'eoa',
  SAFE_VIA_WC = 'safe_via_wc',
  SAFE_UNDEPLOYED = 'safe_undeployed',
  OTHER_SMART_CONTRACT = 'other_smart_contract',
  UNKNOWN = 'unknown',
}

export enum TwapSellAmountUsdBucket {
  NONE = 'none',
  LT_1K = 'lt_1k',
  FROM_1K_TO_10K = '1k_10k',
  FROM_10K_TO_100K = '10k_100k',
  GT_100K = 'gt_100k',
}

export enum TwapEncounterCountBucket {
  ONE = '1',
  TWO_TO_THREE = '2_3',
  FOUR_TO_SEVEN = '4_7',
  EIGHT_PLUS = '8_plus',
}

export interface TwapDemandAnalyticsParams {
  wallet_type?: TwapDemandWalletType
  has_form_input?: boolean
  sell_amount_usd_bucket?: TwapSellAmountUsdBucket
  encounter_count_bucket?: TwapEncounterCountBucket
}
