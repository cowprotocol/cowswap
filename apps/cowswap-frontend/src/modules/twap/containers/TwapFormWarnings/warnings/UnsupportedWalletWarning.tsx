import { ExternalLink, InlineBanner } from '@cowprotocol/ui'

import { UNSUPPORTED_WALLET_LINK } from 'modules/twap/const'

export function UnsupportedWalletWarning() {
  return (
    <InlineBanner bannerType="alert" iconSize={32}>
      <strong>Unsupported wallet detected</strong>
      <p>
        TWAP orders currently require a Safe with a special fallback handler. Have one? Switch to it! Need setup?{' '}
        <ExternalLink href={UNSUPPORTED_WALLET_LINK}>Click here</ExternalLink>. Future updates may extend wallet
        support!
      </p>
      <p>
        <strong>Note:</strong> If you are using a Safe but still see this message, ensure your Safe is deployed!
      </p>
    </InlineBanner>
  )
}
