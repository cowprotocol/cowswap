import { CowSwapSafeAppLink, ExternalLink, InlineBanner } from '@cowprotocol/ui'

import { UNSUPPORTED_WALLET_LINK } from 'modules/twap/const'

export function UnsupportedWalletWarning({ isSafeViaWc }: { isSafeViaWc: boolean }) {
  if (isSafeViaWc) {
    return (
      <InlineBanner bannerType="information">
        <strong>Use Safe web app</strong>
        <p>
          Use the Safe web app for advanced trading. <br />
          Only available in the <CowSwapSafeAppLink />
        </p>
      </InlineBanner>
    )
  }

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
