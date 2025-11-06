import { ReactNode } from 'react'

import { Loader, StatusColorVariant } from '@cowprotocol/ui'

import { t, Trans } from '@lingui/macro'

import { InlineAlert, SpinnerRow, StatusMessage, TitleAccent } from './styles'

import { ReferralModalUiState } from '../../hooks/useReferralModalState'
import { ReferralVerificationStatus } from '../../types'

export interface ReferralStatusMessagesProps {
  uiState: ReferralModalUiState
  verification: ReferralVerificationStatus
  ineligibleMessage: ReactNode
  infoMessage: string
  shouldShowInfo: boolean
  howItWorksLink: ReactNode
}

export function ReferralStatusMessages(props: ReferralStatusMessagesProps): ReactNode {
  const {
    uiState,
    verification,
    ineligibleMessage,
    infoMessage,
    shouldShowInfo,
    howItWorksLink,
  } = props

  return (
    <StatusMessage role="status" aria-live="polite">
      {verification.kind === 'checking' && (
        <SpinnerRow>
          <Loader size="16px" />
          <Trans>Checking code…</Trans>
        </SpinnerRow>
      )}

      {uiState === 'ineligible' && (
        <InlineAlert bannerType={StatusColorVariant.Alert}>
          {ineligibleMessage} {howItWorksLink}
        </InlineAlert>
      )}

      {shouldShowInfo && <InlineAlert bannerType={StatusColorVariant.Success}>{infoMessage}</InlineAlert>}
    </StatusMessage>
  )
}

export function getModalTitle(uiState: ReferralModalUiState): ReactNode {
  switch (uiState) {
    case 'valid':
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
    case 'linked':
      return t`Already linked to a referral code`
    case 'ineligible':
      return t`Your wallet is ineligible`
    default:
      return t`Enter referral code`
  }
}
