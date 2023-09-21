import { ExternalLink } from '@cowprotocol/ui'

import { UNSUPPORTED_WALLET_LINK } from 'modules/twap/const'

import { CowSwapSafeAppLink } from 'common/pure/CowSwapSafeAppLink'
import { InlineBanner } from 'common/pure/InlineBanner'

export function UnsupportedWalletWarning({ isSafeViaWc }: { isSafeViaWc: boolean }) {
  if (isSafeViaWc) {
    return (
      <InlineBanner type="information">
        <strong>Use Safe web app</strong>
        <p>
          Use the Safe web app for advanced trading. <br />
          Only available in the <CowSwapSafeAppLink />
        </p>
      </InlineBanner>
    )
  }

  return (
    <InlineBanner type="alert">
      <strong>Unsupported wallet detected</strong>
      <p>
        TWAP orders currently require a Safe with a special fallback handler. Have one? Switch to it! Need setup?{' '}
        <ExternalLink href={UNSUPPORTED_WALLET_LINK}>Click here</ExternalLink>. Future updates may extend wallet
        support!
      </p>
    </InlineBanner>
  )
}
