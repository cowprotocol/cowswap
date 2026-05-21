export type AffiliateAnalyticsAction =
  | 'affiliate_partner_page_state_viewed'
  | 'affiliate_partner_code_create_started'
  | 'affiliate_partner_code_create_completed'
  | 'affiliate_trader_page_state_viewed'
  | 'affiliate_trader_modal_opened'
  | 'affiliate_trader_modal_state_viewed'
  | 'affiliate_trader_code_verification_started'
  | 'affiliate_trader_code_verification_completed'
  | 'affiliate_trader_expired_code_viewed'

export enum AffiliateModalState {
  CODE_LINKING = 'codeLinking',
  LINKED = 'linked',
  INELIGIBLE = 'ineligible',
  UNSUPPORTED = 'unsupported',
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

export enum AffiliatePartnerCodeCreateFailureReason {
  USER_REJECTED_SIGNATURE = 'userRejectedSignature',
  NETWORK_ERROR = 'networkError',
  CODE_UNAVAILABLE = 'codeUnavailable',
  UNEXPECTED_ERROR = 'unexpectedError',
}

export enum AffiliateVerificationResult {
  SUCCESS = 'success',
  INVALID_FORMAT = 'invalidFormat',
  INVALID_CODE = 'invalidCode',
  SELF_REFERRAL = 'selfReferral',
  SERVICE_UNAVAILABLE = 'serviceUnavailable',
}
