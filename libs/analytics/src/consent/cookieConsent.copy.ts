export interface CookieConsentCopy {
  ariaLabel: string
  message: string
  policyLinkLabel: string
  rejectLabel: string
  acceptLabel: string
  closeLabel: string
}

export const COOKIE_CONSENT_COPY: CookieConsentCopy = {
  ariaLabel: 'Cookie consent',
  message:
    'By clicking “Accept All Cookies”, you agree to the storing of cookies on your device to enhance site navigation, analyze site usage, and assist in our marketing efforts.',
  policyLinkLabel: 'Cookie policy',
  rejectLabel: 'Reject All',
  acceptLabel: 'Accept All Cookies',
  closeLabel: 'Close',
}
