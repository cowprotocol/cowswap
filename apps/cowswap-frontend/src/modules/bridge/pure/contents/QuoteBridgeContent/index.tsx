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

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export function QuoteBridgeContent({
  quoteContext: { recipient, bridgeFee, estimatedTime, buyAmount, buyAmountUsd },
  children,
}: QuoteBridgeContentProps) {
  const buyAmountEl = <TokenAmountDisplay displaySymbol usdValue={buyAmountUsd} currencyAmount={buyAmount} />

  const contents = [
    bridgeFee
      ? {
          withTimelineDot: true,
          label: (
            <>
              Bridge fee <InfoTooltip content="The fee for the bridge transaction." size={14} />
            </>
          ),
          content: bridgeFee.equalTo(0) ? 'FREE' : <TokenAmountDisplay currencyAmount={bridgeFee} />,
        }
      : null,
    estimatedTime
      ? {
          withTimelineDot: true,
          label: (
            <>
              Est. bridge time{' '}
              <InfoTooltip content="The estimated time for the bridge transaction to complete." size={14} />
            </>
          ),
          content: <>~ {displayTime(estimatedTime * 1000, true)}</>,
        }
      : null,
    {
      withTimelineDot: true,
      label: (
        <>
          Recipient{' '}
          <InfoTooltip content="The address that will receive the tokens on the destination chain." size={14} />
        </>
      ),
      content: <RecipientDisplay recipient={recipient} chainId={buyAmount.currency.chainId} logoSize={16} />,
    },
    {
      withTimelineDot: true,
      label: children ? (
        'Min. to receive'
      ) : (
        <ReceiveAmountTitle>
          <b>Min. to receive</b>
        </ReceiveAmountTitle>
      ),
      content: children ? buyAmountEl : <b>{buyAmountEl}</b>,
    },
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
