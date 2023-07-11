import { ExternalLink } from 'legacy/theme'

import { InlineBanner } from 'common/pure/InlineBanner'

export function UnsupportedWalletWarning({ isSafeViaWc }: { isSafeViaWc: boolean }) {
  if (isSafeViaWc) {
    return (
      <InlineBanner type="information">
        <>
          Use the Safe web app for advanced trading. Only available in the{' '}
          <ExternalLink href="https://app.safe.global/share/safe-app?appUrl=https%3A%2F%2Fswap.cow.fi&chain=eth">
            CoW Swap Safe App↗
          </ExternalLink>
        </>
      </InlineBanner>
    )
  }

  return (
    <InlineBanner type="alert">
      <strong>Unsupported wallet detected</strong>
      <br />
      TWAP orders currently require a Safe with a special fallback handler. <br />
      Have one? Switch to it! {/*Need setup? <HashLink to="/faq/limit-order#how-do-fees-work">Click here</HashLink>.*/}{' '}
      <br />
      Future updates may extend wallet support!
      {/*TODO: set a proper link*/}
    </InlineBanner>
  )
}
