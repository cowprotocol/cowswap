import { ReactNode } from 'react'

import { displayTime, isTruthy } from '@cowprotocol/common-utils'
import { InfoTooltip } from '@cowprotocol/ui'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'

import { ConfirmDetailsItem, ReceiveAmountTitle } from 'modules/trade'

import { RecipientDisplay } from '../../RecipientDisplay'
import { TokenAmountDisplay } from '../../TokenAmountDisplay'

export interface QuoteBridgeContentProps {
  bridgeFee: CurrencyAmount<Currency>
  estimatedTime: number | null
  recipient: string
  receiveAmount: CurrencyAmount<Currency>
  receiveAmountUsd: CurrencyAmount<Token> | null
  children?: ReactNode
}

export function QuoteBridgeContent({
  recipient,
  bridgeFee,
  estimatedTime,
  receiveAmount,
  receiveAmountUsd,
  children,
}: QuoteBridgeContentProps) {
  const contents = [
    {
      withTimelineDot: true,
      label: (
        <>
          Bridge fee <InfoTooltip content="The fee for the bridge transaction." size={14} />
        </>
      ),
      content: bridgeFee.equalTo(0) ? 'FREE' : <TokenAmountDisplay currencyAmount={bridgeFee} />,
    },
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
      content: <RecipientDisplay recipient={recipient} chainId={bridgeFee.currency.chainId} logoSize={16} />,
    },
    {
      withTimelineDot: !children,
      label: children ? (
        'Min. to receive'
      ) : (
        <ReceiveAmountTitle>
          <b>Min. to receive</b>
        </ReceiveAmountTitle>
      ),
      content: <TokenAmountDisplay displaySymbol usdValue={receiveAmountUsd} currencyAmount={receiveAmount} />,
    },
  ]

  return (
    <>
      {contents.filter(isTruthy).map(({ withTimelineDot, label, content }) => (
        <ConfirmDetailsItem withTimelineDot={withTimelineDot} label={label}>
          {content}
        </ConfirmDetailsItem>
      ))}
      {children}
    </>
  )
}
