import { ReactNode } from 'react'

import { Loader, StatusColorVariant } from '@cowprotocol/ui'

import { t, Trans } from '@lingui/macro'

import { InlineAlert, SpinnerRow, StatusMessage, TitleAccent } from './styles'

import { ReferralModalUiState } from '../../hooks/useReferralModalState'
import { ReferralVerificationStatus } from '../../types'

export interface ReferralStatusMessagesProps {
  verification: ReferralVerificationStatus
  infoMessage: string
  shouldShowInfo: boolean
}

export function ReferralStatusMessages(props: ReferralStatusMessagesProps): ReactNode {
  const { verification, infoMessage, shouldShowInfo } = props

  return (
    <StatusMessage role="status" aria-live="polite">
      {verification.kind === 'checking' && (
        <SpinnerRow>
          <Loader size="16px" />
          <Trans>Checking code…</Trans>
        </SpinnerRow>
      )}

      {shouldShowInfo && <InlineAlert bannerType={StatusColorVariant.Success}>{infoMessage}</InlineAlert>}
    </StatusMessage>
  )
}

export function getModalTitle(uiState: ReferralModalUiState, options: { hasRejection?: boolean } = {}): ReactNode {
  const { hasRejection = false } = options

  if (uiState === 'linked' || (uiState === 'valid' && hasRejection)) {
    return t`Already linked to a referral code`
  }

  if (uiState === 'valid') {
    return (
      <>
        <Trans>Referral code</Trans>
        <br />
        <span>
          <Trans>successfully</Trans>{' '}
          <TitleAccent>
            <Trans>applied!</Trans>
          </TitleAccent>
        </span>
      </>
    )
  }

  if (uiState === 'ineligible') {
    return t`Your wallet is ineligible`
  }

  return t`Enter referral code`
}
