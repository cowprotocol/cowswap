import { useState } from 'react'

import { COOKIE_CONSENT_COPY } from '@cowprotocol/analytics'

import { CookieConsentBanner } from './CookieConsentBanner.pure'

const POLICY_HREF = 'https://cow.fi/legal/cowswap-cookie-policy'

function InteractiveBanner({ isReopened }: { isReopened: boolean }): React.ReactElement {
  const [choice, setChoice] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(true)

  if (!isOpen) {
    return (
      <button type="button" onClick={() => setIsOpen(true)}>
        Cookie settings ({choice ?? 'closed'})
      </button>
    )
  }

  const choose = (value: string) => (): void => {
    setChoice(value)
    setIsOpen(false)
  }

  return (
    <CookieConsentBanner
      copy={COOKIE_CONSENT_COPY}
      policyHref={POLICY_HREF}
      onAccept={choose('accepted')}
      onReject={choose('rejected')}
      onClose={isReopened ? () => setIsOpen(false) : undefined}
    />
  )
}

const CookieConsentBannerFixtures = {
  'First visit': () => <InteractiveBanner isReopened={false} />,
  'Reopened from cookie settings': () => <InteractiveBanner isReopened />,
}

export default CookieConsentBannerFixtures
