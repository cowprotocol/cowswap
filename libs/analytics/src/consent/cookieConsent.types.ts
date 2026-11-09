export type CookieConsentChoice = 'accepted' | 'rejected'

export interface CookieConsentRecord {
  v: 1
  choice: CookieConsentChoice
  /** ISO 8601 timestamp */
  decidedAt: string
  policyVersion: number
}

export interface CookieConsentState {
  consent: CookieConsentRecord | null
  isSettingsOpen: boolean
}
