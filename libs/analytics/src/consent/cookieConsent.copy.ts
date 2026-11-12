export interface CookieConsentCopy {
  title: string
  ariaLabel: string
  message: string
  policyLinkLabel: string
  rejectLabel: string
  acceptLabel: string
  closeLabel: string
}

export const COOKIE_CONSENT_COPY: CookieConsentCopy = {
  title: 'Cookies? Your mooove.',
  ariaLabel: 'Cookie consent',
  message: 'You want privacy. We want to know if our ads work. Nothing tracks you until you pick.',
  policyLinkLabel: 'Cookie policy',
  rejectLabel: 'Reject All',
  acceptLabel: 'Accept All',
  closeLabel: 'Close',
}
