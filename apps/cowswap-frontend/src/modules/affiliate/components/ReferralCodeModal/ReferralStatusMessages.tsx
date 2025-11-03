import { ReactNode } from 'react'

import { Loader, StatusColorVariant } from '@cowprotocol/ui'

import { t, Trans } from '@lingui/macro'

import { ErrorInline, InlineAlert, SpinnerRow, StatusMessage } from './styles'

import { ReferralModalUiState } from '../../hooks/useReferralModalState'
import { ReferralVerificationStatus } from '../../types'

export interface ReferralStatusMessagesProps {
  uiState: ReferralModalUiState
  verification: ReferralVerificationStatus
  invalidMessage: string
  expiredMessage: string
  errorMessage?: string
  linkedMessage: string
  ineligibleMessage: string
  infoMessage: string
  shouldShowInfo: boolean
  howItWorksLink: ReactNode
}

export function ReferralStatusMessages(props: ReferralStatusMessagesProps): ReactNode {
  const {
    uiState,
    verification,
    invalidMessage,
    expiredMessage,
    errorMessage,
    linkedMessage,
    ineligibleMessage,
    infoMessage,
    shouldShowInfo,
    howItWorksLink,
  } = props

  const hasError = verification.kind === 'invalid' || verification.kind === 'expired'

  return (
    <StatusMessage role="status" aria-live="polite">
      {verification.kind === 'checking' && (
        <SpinnerRow>
          <Loader size="16px" />
          <Trans>Checking code…</Trans>
        </SpinnerRow>
      )}

      {hasError && (
        <ErrorInline bannerType={StatusColorVariant.Alert}>
          {verification.kind === 'expired' ? expiredMessage : invalidMessage}
        </ErrorInline>
      )}

      {verification.kind === 'error' && errorMessage && (
        <ErrorInline bannerType={StatusColorVariant.Alert}>{errorMessage}</ErrorInline>
      )}

      {uiState === 'linked' && (
        <InlineAlert bannerType={StatusColorVariant.Info}>
          {linkedMessage} {howItWorksLink}
        </InlineAlert>
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

export function getModalTitle(uiState: ReferralModalUiState): string {
  switch (uiState) {
    case 'linked':
      return t`Already linked to a referral code.`
    case 'ineligible':
      return t`Your wallet is ineligible.`
    default:
      return t`Enter referral code.`
  }
}
