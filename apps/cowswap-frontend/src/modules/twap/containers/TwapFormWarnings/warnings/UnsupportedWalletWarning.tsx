import { ReactNode } from 'react'

import { getSafeAccountUrl } from '@cowprotocol/core'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { ExternalLink, InlineBanner, StatusColorVariant } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'

import { UNSUPPORTED_WALLET_LINK } from 'modules/twap/const'

import { toCowSwapGtmEvent } from 'common/analytics/types'

import {
  createUnsupportedWalletAnalyticsEvent,
  UnsupportedWalletAnalyticsData,
} from '../unsupportedWalletAnalytics.utils'

export interface UnsupportedWalletWarningProps {
  analyticsData: UnsupportedWalletAnalyticsData
  chainId: SupportedChainId
  account?: string
  isSafeViaWc: boolean
}

export function UnsupportedWalletWarning({
  analyticsData,
  isSafeViaWc,
  chainId,
  account,
}: UnsupportedWalletWarningProps): ReactNode {
  if (isSafeViaWc && account) {
    return (
      <InlineBanner bannerType={StatusColorVariant.Info}>
        <strong>
          <Trans>Use Safe web app</Trans>
        </strong>
        <p>
          <Trans>
            Use the{' '}
            <ExternalLink
              href={getSafeAccountUrl(chainId, account)}
              data-click-event={toCowSwapGtmEvent(
                createUnsupportedWalletAnalyticsEvent('twap_unsupported_wallet_safe_app_clicked', analyticsData),
              )}
            >
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
          <ExternalLink
            href={UNSUPPORTED_WALLET_LINK}
            data-click-event={toCowSwapGtmEvent(
              createUnsupportedWalletAnalyticsEvent('twap_unsupported_wallet_docs_clicked', analyticsData),
            )}
          >
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
    </InlineBanner>
  )
}
