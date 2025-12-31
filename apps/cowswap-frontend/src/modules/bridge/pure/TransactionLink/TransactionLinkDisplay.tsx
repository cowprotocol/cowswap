import { ReactNode } from 'react'

import { ExternalLink } from '@cowprotocol/ui'

import ReceiptIcon from 'assets/cow-swap/icon-receipt.svg'

import { ConfirmDetailsItem } from 'modules/trade'

import { StyledTimelineReceiptIcon, TimelineIconCircleWrapper } from '../../styles'

interface TransactionLinkDisplayProps {
  link: string
  label: string
  linkText: string
}

export function TransactionLinkDisplay({ link, label, linkText }: TransactionLinkDisplayProps): ReactNode {
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
      <ExternalLink href={link}>{linkText}</ExternalLink>
    </ConfirmDetailsItem>
  )
}
