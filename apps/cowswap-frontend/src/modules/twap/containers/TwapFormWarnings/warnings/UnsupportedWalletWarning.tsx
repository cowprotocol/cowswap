import { getSafeAccountUrl } from '@cowprotocol/core'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { ExternalLink, InlineBanner, StatusColorVariant } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'

import { UNSUPPORTED_WALLET_LINK } from 'modules/twap/const'

export interface UnsupportedWalletWarningProps {
  chainId: SupportedChainId
  account?: string
  isSafeViaWc: boolean
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function UnsupportedWalletWarning({ isSafeViaWc, chainId, account }: UnsupportedWalletWarningProps) {
  if (isSafeViaWc && account) {
    return (
      <InlineBanner bannerType={StatusColorVariant.Info}>
        <strong>
          <Trans>Use Safe web app</Trans>
        </strong>
        <p>
          <Trans>
            Use the <ExternalLink href={getSafeAccountUrl(chainId, account)}>Safe app</ExternalLink> for advanced
            trading.
          </Trans>
        </p>
      </InlineBanner>
    )
  }

  return (
    <InlineBanner bannerType={StatusColorVariant.Alert} iconSize={32}>
      <strong>
        <Trans>Unsupported wallet detected</Trans>
      </strong>
      <p>
        <Trans>
          TWAP orders currently require a Safe with a special fallback handler. Have one? Switch to it! Need setup?{' '}
          <ExternalLink href={UNSUPPORTED_WALLET_LINK}>Click here</ExternalLink>. Future updates may extend wallet
          support!
        </Trans>
      </p>
      <p>
        <Trans>
          <strong>Note:</strong> If you are using a Safe but still see this message, ensure your Safe is deployed!
        </Trans>
      </p>
    </InlineBanner>
  )
}
