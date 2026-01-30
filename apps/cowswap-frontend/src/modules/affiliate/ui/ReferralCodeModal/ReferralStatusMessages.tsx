import { ReactNode } from 'react'

import { StatusColorVariant } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import { InlineAlert, StatusMessage, TitleAccent } from './styles'

import { ReferralModalUiState } from '../../model/hooks/useReferralModalState'

export interface ReferralStatusMessagesProps {
  infoMessage: string
  shouldShowInfo: boolean
}

export function ReferralStatusMessages(props: ReferralStatusMessagesProps): ReactNode {
  const { infoMessage, shouldShowInfo } = props

  return (
    <StatusMessage role="status" aria-live="polite">
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
