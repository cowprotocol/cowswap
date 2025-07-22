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

const estBridgeTimeTooltip = (
  <>
    Est. bridge time <InfoTooltip content="The estimated time for the bridge transaction to complete." size={14} />
  </>
)

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
      {isQuoteDisplay && (
        <ConfirmDetailsItem
          withTimelineDot
          label="Min. to deposit"
          tooltip="The minimum possible outcome after swap, including costs and slippage."
        >
          <TokenAmountDisplay
            displaySymbol
            usdValue={bridgeMinDepositAmountUsd}
            currencyAmount={bridgeMinDepositAmount}
          />
        </ConfirmDetailsItem>
      )}
      {bridgeFee && (
        <ConfirmDetailsItem
          withTimelineDot
          label={
            <>
              Bridge costs <InfoTooltip content="Bridge transaction costs." size={14} />
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
        <ConfirmDetailsItem withTimelineDot label={estBridgeTimeTooltip}>
          ~ {displayTime(estimatedTime * 1000, true)}
        </ConfirmDetailsItem>
      )}

      <RecipientDetailsItem recipient={recipient} chainId={buyAmount.currency.chainId} />

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
