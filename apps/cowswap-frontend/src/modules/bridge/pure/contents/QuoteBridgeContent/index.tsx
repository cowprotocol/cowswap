import { ReactNode } from 'react'

import { displayTime } from '@cowprotocol/common-utils'
import { InfoTooltip } from '@cowprotocol/ui'

import { ConfirmDetailsItem, ReceiveAmountTitle } from 'modules/trade'
import { useUsdAmount } from 'modules/usdAmount'

import { SuccessTextBold } from '../../../styles'
import { QuoteBridgeContext } from '../../../types'
import { RecipientDetailsItem } from '../../RecipientDetailsItem'
import { TokenAmountDisplay } from '../../TokenAmountDisplay'

const MIN_RECEIVE_TITLE = 'Min. to receive'

export interface QuoteBridgeContentProps {
  quoteContext: QuoteBridgeContext
  children?: ReactNode
}

export function QuoteBridgeContent({
  quoteContext: { recipient, bridgeFee, estimatedTime, buyAmount, buyAmountUsd, bridgeMinReceiveAmount },
  children,
}: QuoteBridgeContentProps): ReactNode {
  const bridgeFeeUsd = useUsdAmount(bridgeFee).value

  const minReceiveAmountEl = (
    <TokenAmountDisplay
      displaySymbol
      usdValue={bridgeMinReceiveAmount ? null : buyAmountUsd}
      currencyAmount={bridgeMinReceiveAmount || buyAmount}
    />
  )

  return (
    <>
      {bridgeFee && (
        <ConfirmDetailsItem
          withTimelineDot
          label={
            <>
              Bridge fee <InfoTooltip content="The fee for the bridge transaction." size={14} />
            </>
          }
        >
          {bridgeFee.equalTo(0) ? (
            <SuccessTextBold>FREE</SuccessTextBold>
          ) : (
            <TokenAmountDisplay currencyAmount={bridgeFee} usdValue={bridgeFeeUsd} />
          )}
        </ConfirmDetailsItem>
      )}

      {estimatedTime && (
        <ConfirmDetailsItem
          withTimelineDot
          label={
            <>
              Est. bridge time{' '}
              <InfoTooltip content="The estimated time for the bridge transaction to complete." size={14} />
            </>
          }
        >
          ~ {displayTime(estimatedTime * 1000, true)}
        </ConfirmDetailsItem>
      )}

      <RecipientDetailsItem recipient={recipient} chainId={buyAmount.currency.chainId} />

      <ConfirmDetailsItem
        withTimelineDot
        label={
          children ? (
            MIN_RECEIVE_TITLE
          ) : (
            <ReceiveAmountTitle>
              <b>{MIN_RECEIVE_TITLE}</b>
            </ReceiveAmountTitle>
          )
        }
      >
        {children ? minReceiveAmountEl : <b>{minReceiveAmountEl}</b>}
      </ConfirmDetailsItem>

      {children}
    </>
  )
}
