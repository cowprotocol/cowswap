import { ReactNode, useEffect } from 'react'

import { getSafeAccountUrl } from '@cowprotocol/core'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { ButtonSecondary, ExternalLink, InlineBanner, StatusColorVariant } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import styled from 'styled-components/macro'

import { UNSUPPORTED_WALLET_LINK } from 'modules/twap/const'

const InterestButton = styled(ButtonSecondary).attrs({ type: 'button' })`
  width: fit-content;
  margin-top: 4px;
`

export interface UnsupportedWalletWarningProps {
  chainId: SupportedChainId
  account?: string
  isSafeViaWc: boolean
  isInterestButtonVisible: boolean
  isInterestRegistered: boolean
  onInterestClick(): void
  onSafeWcBannerClick(): void
  onSafeWcBannerShown(): void
  onSetupLinkClick(): void
  onUnsupportedWalletShown(): void
}

export function UnsupportedWalletWarning({
  isSafeViaWc,
  chainId,
  account,
  isInterestButtonVisible,
  isInterestRegistered,
  onInterestClick,
  onSafeWcBannerClick,
  onSafeWcBannerShown,
  onSetupLinkClick,
  onUnsupportedWalletShown,
}: UnsupportedWalletWarningProps): ReactNode {
  useEffect(() => {
    if (isSafeViaWc && account) {
      onSafeWcBannerShown()
    } else {
      onUnsupportedWalletShown()
    }
  }, [account, isSafeViaWc, onSafeWcBannerShown, onUnsupportedWalletShown])

  if (isSafeViaWc && account) {
    return (
      <InlineBanner bannerType={StatusColorVariant.Info}>
        <strong>
          <Trans>Use Safe web app</Trans>
        </strong>
        <p>
          <Trans>
            Use the{' '}
            <ExternalLink href={getSafeAccountUrl(chainId, account)} onClickOptional={onSafeWcBannerClick}>
              Safe app
            </ExternalLink>{' '}
            for advanced trading.
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
          <ExternalLink href={UNSUPPORTED_WALLET_LINK} onClickOptional={onSetupLinkClick}>
            Click here
          </ExternalLink>
          . Future updates may extend wallet support!
        </Trans>
      </p>
      <p>
        <Trans>
          <strong>Note:</strong> If you are using a Safe but still see this message, ensure your Safe is deployed!
        </Trans>
      </p>
      {isInterestButtonVisible && (
        <InterestButton
          onClick={onInterestClick}
          disabled={isInterestRegistered}
          $fontSize="13px"
          $minHeight="32px"
          padding="6px 12px"
        >
          {isInterestRegistered ? (
            <Trans>Thanks - noted!</Trans>
          ) : (
            <Trans>Want TWAP with this wallet? Let us know</Trans>
          )}
        </InterestButton>
      )}
    </InlineBanner>
  )
}
