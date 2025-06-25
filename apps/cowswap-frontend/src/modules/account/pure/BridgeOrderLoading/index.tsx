import { ReactNode } from 'react'

import { getChainInfo } from '@cowprotocol/common-const'
import { TokenLogo } from '@cowprotocol/tokens'
import { TokenAmount } from '@cowprotocol/ui'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { useBridgeSupportedNetworks } from 'entities/bridgeProvider'

import { Order } from 'legacy/state/orders/actions'

import { ShimmerWrapper, SummaryRow } from 'common/pure/OrderSummaryRow'

interface BridgeOrderLoadingProps {
  order: Order
  children: ReactNode
  fulfillmentTime?: string
  isCustomRecipient?: boolean
}

export function BridgeOrderLoading({
  order,
  fulfillmentTime,
  isCustomRecipient,
  children,
}: BridgeOrderLoadingProps): ReactNode {
  const { data: bridgeSupportedNetworks } = useBridgeSupportedNetworks()
  const inputAmount = CurrencyAmount.fromRawAmount(order.inputToken, order.sellAmount)
  const feeAmount = CurrencyAmount.fromRawAmount(order.inputToken, order.feeAmount)
  const sourceChainData = getChainInfo(order.inputToken.chainId)
  const targetChainData = bridgeSupportedNetworks?.find((chain) => chain.id === order.outputToken.chainId)

  return (
    <>
      <SummaryRow>
        <b>From</b>
        <i>
          <TokenLogo token={order.inputToken} size={20} />
          <TokenAmount amount={inputAmount.add(feeAmount)} tokenSymbol={order.inputToken} />
          {sourceChainData && ` on ${sourceChainData.name}`}
        </i>
      </SummaryRow>
      <SummaryRow>
        <b>To at least</b>
        <i>
          <TokenLogo token={order.outputToken} size={20} />
          <ShimmerWrapper />
          {targetChainData && ` on ${targetChainData.label}`}
        </i>
      </SummaryRow>
      <SummaryRow>
        <b>Swap</b>
        <i>
          <ShimmerWrapper />
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
          <b>Filled on</b>
          <i>{fulfillmentTime}</i>
        </SummaryRow>
      )}
      {isCustomRecipient && (
        <SummaryRow>
          <b>Recipient</b>
          <i>
            <ShimmerWrapper />
          </i>
        </SummaryRow>
      )}
      {children}
    </>
  )
}
