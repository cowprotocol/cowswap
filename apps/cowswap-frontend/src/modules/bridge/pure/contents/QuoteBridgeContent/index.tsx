import { ReactNode } from 'react'

import { displayTime, isTruthy } from '@cowprotocol/common-utils'
import { InfoTooltip } from '@cowprotocol/ui'

import { ConfirmDetailsItem, ReceiveAmountTitle } from 'modules/trade'

import { QuoteBridgeContext } from '../../../types'
import { RecipientDisplay } from '../../RecipientDisplay'
import { TokenAmountDisplay } from '../../TokenAmountDisplay'

export interface QuoteBridgeContentProps {
  quoteContext: QuoteBridgeContext
  children?: ReactNode
}

interface ContentItem {
  withTimelineDot?: boolean
  label: ReactNode
  content: ReactNode
}

function createBridgeFeeContent(bridgeFee: QuoteBridgeContext['bridgeFee']): ContentItem | null {
  if (!bridgeFee) return null

  return {
    withTimelineDot: true,
    label: (
      <>
        Bridge fee <InfoTooltip content="The fee for the bridge transaction." size={14} />
      </>
    ),
    content: bridgeFee.equalTo(0) ? 'FREE' : <TokenAmountDisplay currencyAmount={bridgeFee} />,
  }
}

function createEstimatedTimeContent(estimatedTime: QuoteBridgeContext['estimatedTime']): ContentItem | null {
  if (!estimatedTime) return null

  return {
    withTimelineDot: true,
    label: (
      <>
        Est. bridge time <InfoTooltip content="The estimated time for the bridge transaction to complete." size={14} />
      </>
    ),
    content: <>~ {displayTime(estimatedTime * 1000, true)}</>,
  }
}

function createRecipientContent(recipient: QuoteBridgeContext['recipient'], chainId: number): ContentItem {
  return {
    withTimelineDot: true,
    label: (
      <>
        Recipient <InfoTooltip content="The address that will receive the tokens on the destination chain." size={14} />
      </>
    ),
    content: <RecipientDisplay recipient={recipient} chainId={chainId} logoSize={16} />,
  }
}

function createReceiveAmountContent(buyAmountEl: ReactNode, hasChildren: boolean): ContentItem {
  return {
    withTimelineDot: true,
    label: hasChildren ? (
      'Min. to receive'
    ) : (
      <ReceiveAmountTitle>
        <b>Min. to receive</b>
      </ReceiveAmountTitle>
    ),
    content: hasChildren ? buyAmountEl : <b>{buyAmountEl}</b>,
  }
}

export function QuoteBridgeContent({
  quoteContext: { recipient, bridgeFee, estimatedTime, buyAmount, buyAmountUsd },
  children,
}: QuoteBridgeContentProps): ReactNode {
  const buyAmountEl = <TokenAmountDisplay displaySymbol usdValue={buyAmountUsd} currencyAmount={buyAmount} />

  const contents = [
    createBridgeFeeContent(bridgeFee),
    createEstimatedTimeContent(estimatedTime),
    createRecipientContent(recipient, buyAmount.currency.chainId),
    createReceiveAmountContent(buyAmountEl, !!children),
  ]

  return (
    <>
      {contents.filter(isTruthy).map(({ withTimelineDot, label, content }, index) => (
        <ConfirmDetailsItem key={index} withTimelineDot={withTimelineDot} label={label}>
          {content}
        </ConfirmDetailsItem>
      ))}
      {children}
    </>
  )
}
