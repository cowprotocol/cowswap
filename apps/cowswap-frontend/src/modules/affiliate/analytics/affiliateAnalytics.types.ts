export enum AffiliateEntrySource {
  PARTNER_PAGE_ONBOARD = 'partnerPageOnboard',
  TRADER_PAGE_ONBOARD = 'traderPageOnboard',
  TRADER_REWARDS_ROW = 'traderRewardsRow',
  HEADER_REFER_BUTTON = 'headerReferButton',
  DEEP_LINK = 'deepLink',
  TRADER_PAGE_CODE_CARD = 'traderPageCodeCard',
}

export enum AffiliatePageState {
  ONBOARD = 'onboard',
  CODE_CREATION = 'codeCreation',
  CODE_LIVE = 'codeLive',
  LOADING = 'loading',
  UNSUPPORTED = 'unsupported',
  INELIGIBLE = 'ineligible',
  ELIGIBILITY_UNKNOWN = 'eligibilityUnknown',
  LINKED = 'linked',
}

export enum AffiliateModalState {
  CODE_LINKING = 'codeLinking',
  LINKED = 'linked',
  INELIGIBLE = 'ineligible',
  UNSUPPORTED = 'unsupported',
}

export enum AffiliateCodeSource {
  MANUAL_INPUT = 'manualInput',
  URL_REF_PARAM = 'urlRefParam',
  LOCAL_ORDER_RECOVERY = 'localOrderRecovery',
  ORDERBOOK_RECOVERY = 'orderbookRecovery',
  LEGACY_UNKNOWN = 'legacyUnknown',
}

export enum AffiliateVerificationResult {
  SUCCESS = 'success',
  INVALID_FORMAT = 'invalidFormat',
  INVALID_CODE = 'invalidCode',
  SELF_REFERRAL = 'selfReferral',
  SERVICE_UNAVAILABLE = 'serviceUnavailable',
}

export enum AffiliatePartnerCodeAvailabilityResult {
  AVAILABLE = 'available',
  UNAVAILABLE = 'unavailable',
  NETWORK_ERROR = 'networkError',
}

export enum AffiliatePartnerCodeCreateFailureReason {
  USER_REJECTED_SIGNATURE = 'userRejectedSignature',
  NETWORK_ERROR = 'networkError',
  CODE_UNAVAILABLE = 'codeUnavailable',
  UNEXPECTED_ERROR = 'unexpectedError',
}

export type AffiliateAnalyticsAction =
  | 'affiliate_partner_page_state_viewed'
  | 'affiliate_partner_onboard_cta_clicked'
  | 'affiliate_partner_terms_clicked'
  | 'affiliate_partner_how_it_works_clicked'
  | 'affiliate_partner_code_suggestion_regenerated'
  | 'affiliate_partner_code_availability_resolved'
  | 'affiliate_partner_code_create_started'
  | 'affiliate_partner_code_create_completed'
  | 'affiliate_partner_referral_code_copied'
  | 'affiliate_partner_referral_link_copied'
  | 'affiliate_partner_share_on_x_clicked'
  | 'affiliate_partner_qr_modal_opened'
  | 'affiliate_partner_qr_downloaded'
  | 'affiliate_trader_page_state_viewed'
  | 'affiliate_trader_onboard_cta_clicked'
  | 'affiliate_trader_rewards_row_clicked'
  | 'affiliate_trader_referral_url_detected'
  | 'affiliate_trader_modal_opened'
  | 'affiliate_trader_modal_state_viewed'
  | 'affiliate_trader_code_verification_started'
  | 'affiliate_trader_code_verification_completed'
  | 'affiliate_trader_code_input_edited'
  | 'affiliate_trader_code_removed'
  | 'affiliate_trader_payout_confirmation_toggled'
  | 'affiliate_trader_linked_code_recovered'
  | 'affiliate_trader_modal_primary_cta_clicked'
