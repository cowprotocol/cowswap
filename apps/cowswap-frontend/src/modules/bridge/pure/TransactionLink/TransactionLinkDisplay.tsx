import { ReactNode } from 'react'

import { getSafeAbsoluteUrl } from '@cowprotocol/common-utils'
import ReceiptIcon from '@cowprotocol/assets/cow-swap/icon-receipt.svg'
import { ExternalLink } from '@cowprotocol/ui'

import { ConfirmDetailsItem } from 'modules/trade'

import { StyledTimelineReceiptIcon, TimelineIconCircleWrapper } from '../../styles'

interface TransactionLinkDisplayProps {
  link: string
  label: string
  linkText: string
}

export function TransactionLinkDisplay({ link, label, linkText }: TransactionLinkDisplayProps): ReactNode {
  const safeLink = getSafeAbsoluteUrl(link)

  if (!safeLink) {
    return null
  }

  return (
    <ConfirmDetailsItem
      label={
        <>
          <TimelineIconCircleWrapper padding="0" bgColor={'transparent'}>
            <StyledTimelineReceiptIcon src={ReceiptIcon} />
          </TimelineIconCircleWrapper>{' '}
          {label}
        </>
      }
    >
      <ExternalLink href={safeLink}>{linkText}</ExternalLink>
    </ConfirmDetailsItem>
  )
}
