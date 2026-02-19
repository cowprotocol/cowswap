import { ReactNode } from 'react'

import { StatusColorVariant } from '@cowprotocol/ui'

import { InlineAlert, StatusMessage } from './styles'

export interface TraderReferralCodeStatusMessagesProps {
  infoMessage: string
  shouldShowInfo: boolean
  variant: StatusColorVariant
}

export function TraderReferralCodeStatusMessages(props: TraderReferralCodeStatusMessagesProps): ReactNode {
  const { infoMessage, shouldShowInfo, variant } = props

  if (!shouldShowInfo) return null

  return (
    <StatusMessage role="status" aria-live="polite">
      <InlineAlert bannerType={variant} hideIcon>
        {infoMessage}
      </InlineAlert>
    </StatusMessage>
  )
}
