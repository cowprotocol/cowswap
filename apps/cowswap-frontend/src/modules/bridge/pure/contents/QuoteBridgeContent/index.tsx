import { ReactNode } from 'react'

import { displayTime } from '@cowprotocol/common-utils'
import { InfoTooltip } from '@cowprotocol/ui'

import { ConfirmDetailsItem, ReceiveAmountTitle } from 'modules/trade'
import { useUsdAmount } from 'modules/usdAmount'

import { QuoteBridgeContext } from '../../../types'
import { RecipientDetailsItem } from '../../RecipientDetailsItem'
import { TokenAmountDisplay } from '../../TokenAmountDisplay'

const MIN_RECEIVE_TITLE = 'Min. to receive'

export interface QuoteBridgeContentProps {
  isQuoteDisplay?: boolean
  quoteContext: QuoteBridgeContext
  children?: ReactNode
}

export function QuoteBridgeContent({
  isQuoteDisplay = false,
  quoteContext: {
    recipient,
    bridgeFee,
    estimatedTime,
    buyAmount,
    buyAmountUsd,
    bridgeMinReceiveAmount,
    bridgeMinDepositAmount,
    bridgeMinDepositAmountUsd,
  },
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
              Bridge costs <InfoTooltip content="Bridge transaction costs." size={14} />
            </>
          }
        >
          {bridgeFee.equalTo(0) ? 'FREE' : <TokenAmountDisplay currencyAmount={bridgeFee} usdValue={bridgeFeeUsd} />}
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

      {isQuoteDisplay && (
        <ConfirmDetailsItem withTimelineDot label="Min. to deposit">
          <TokenAmountDisplay
            displaySymbol
            usdValue={bridgeMinDepositAmountUsd}
            currencyAmount={bridgeMinDepositAmount}
          />
        </ConfirmDetailsItem>
      )}

      <ConfirmDetailsItem
        withTimelineDot
        label={
          !isQuoteDisplay ? (
            MIN_RECEIVE_TITLE
          ) : (
            <ReceiveAmountTitle>
              <b>{MIN_RECEIVE_TITLE}</b>
            </ReceiveAmountTitle>
          )
        }
      >
        {!isQuoteDisplay ? minReceiveAmountEl : <b>{minReceiveAmountEl}</b>}
      </ConfirmDetailsItem>

      {children}
    </>
  )
}
