const GRANTED_CONSENT = {
  ad_storage: 'granted',
  ad_user_data: 'granted',
  ad_personalization: 'granted',
  analytics_storage: 'granted',
}

export function grantGoogleConsent(): void {
  if (typeof window === 'undefined') return

  gtag('consent', 'default', GRANTED_CONSENT)
}

// Google tags only process commands pushed as an `arguments` object, not as an array
function gtag(..._args: unknown[]): void {
  const dataLayer = window.dataLayer ?? []

  window.dataLayer = dataLayer
  dataLayer.push(arguments)
}
