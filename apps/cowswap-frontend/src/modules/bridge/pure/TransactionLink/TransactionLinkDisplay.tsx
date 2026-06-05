import { ReactNode } from 'react'

import iconReceiptSrc from '@cowprotocol/assets/cow-swap/icon-receipt.svg'
import { getSafeAbsoluteUrl } from '@cowprotocol/common-utils'
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
            <StyledTimelineReceiptIcon src={iconReceiptSrc} />
          </TimelineIconCircleWrapper>{' '}
          {label}
        </>
      }
    >
      <ExternalLink href={safeLink}>{linkText}</ExternalLink>
    </ConfirmDetailsItem>
  )
}
