import { ReactNode } from 'react'

import { getChainInfo } from '@cowprotocol/common-const'
import { TokenLogo } from '@cowprotocol/tokens'
import { TokenAmount } from '@cowprotocol/ui'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { useBridgeSupportedNetwork } from 'entities/bridgeProvider'

import { Order } from 'legacy/state/orders/actions'

import { ShimmerWrapper, SummaryRow } from 'common/pure/OrderSummaryRow'

interface BridgeOrderLoadingProps {
  order: Order
  children: ReactNode
  fulfillmentTime?: string
}

export function BridgeOrderLoading({ order, fulfillmentTime, children }: BridgeOrderLoadingProps): ReactNode {
  const inputAmount = CurrencyAmount.fromRawAmount(order.inputToken, order.sellAmount)
  const feeAmount = CurrencyAmount.fromRawAmount(order.inputToken, order.feeAmount)

  const isCachedOrder = order.inputToken.chainId !== order.outputToken.chainId
  const sourceChainData = getChainInfo(order.inputToken.chainId)
  const targetChainData = useBridgeSupportedNetwork(isCachedOrder ? order.outputToken.chainId : undefined)

  return (
    <>
      <SummaryRow>
        <b>From</b>
        <i>
          <TokenLogo token={order.inputToken} size={20} />
          <TokenAmount amount={inputAmount.add(feeAmount)} tokenSymbol={order.inputToken} />
          {sourceChainData && ` on ${sourceChainData.label}`}
        </i>
      </SummaryRow>
      <SummaryRow>
        <b>To at least</b>
        <i>
          {isCachedOrder && <TokenLogo token={order.outputToken} size={20} />}
          <ShimmerWrapper />
          {targetChainData && ` on ${targetChainData.label}`}
        </i>
      </SummaryRow>
      <SummaryRow>
        <b>Swap</b>
        <i>
          {fulfillmentTime ? (
            <>✓ Filled</>
          ) : (
            <ShimmerWrapper />
          )}
        </i>
      </SummaryRow>
      <SummaryRow>
        <b>Bridge</b>
        <i>
          <ShimmerWrapper />
        </i>
      </SummaryRow>
      {fulfillmentTime && (
        <SummaryRow>
          <b>Swap filled on</b>
          <i>{fulfillmentTime}</i>
        </SummaryRow>
      )}
      <SummaryRow>
        <b>Recipient</b>
        <i>
          <ShimmerWrapper />
        </i>
      </SummaryRow>
      {children}
    </>
  )
}
