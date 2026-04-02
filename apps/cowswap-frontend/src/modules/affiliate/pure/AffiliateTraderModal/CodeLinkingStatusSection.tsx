import { ReactNode } from 'react'

import { StatusColorVariant } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'

import { InlineAlert, StatusMessage } from './styles'

import { type TraderInfoResponse } from '../../api/bffAffiliateApi.types'
import { TraderWalletStatus } from '../../hooks/useAffiliateTraderWallet'

export interface CodeLinkingStatusSectionProps {
  walletStatus: TraderWalletStatus
  codeInfo?: TraderInfoResponse | null
}

export function CodeLinkingStatusSection(props: CodeLinkingStatusSectionProps): ReactNode {
  const { walletStatus, codeInfo } = props

  if (walletStatus === TraderWalletStatus.ELIGIBILITY_UNKNOWN) {
    return (
      <StatusMessage role="status" aria-live="polite">
        <InlineAlert bannerType={StatusColorVariant.Warning} hideIcon>
          <Trans>
            We weren't able to check your eligibility. Feel free to continue, but you won't receive rewards if you
            traded on CoW Swap before.
          </Trans>
        </InlineAlert>
      </StatusMessage>
    )
  }

  if (walletStatus === TraderWalletStatus.ELIGIBLE) {
    const timeCapDays = codeInfo?.timeCapDays

    return (
      <StatusMessage role="status" aria-live="polite">
        <InlineAlert bannerType={StatusColorVariant.Info} hideIcon>
          {timeCapDays ? (
            <Trans>
              Your wallet is eligible for rewards. After your first trade, the referral code will bind and stay active
              for {timeCapDays} days.
            </Trans>
          ) : (
            <Trans>
              Your wallet is eligible for rewards. After your first trade, the referral code will bind and stay active
              for the entire program.
            </Trans>
          )}
        </InlineAlert>
      </StatusMessage>
    )
  }

  return null
}
