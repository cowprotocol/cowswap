import { useCallback, useMemo } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { TokenInfo } from '@cowprotocol/types'

import { EnhancedTransactionLink } from 'legacy/components/EnhancedTransactionLink'
import { HashType } from 'legacy/state/enhancedTransactions/reducer'
import { useOrder } from 'legacy/state/orders/hooks'

import { useGetSurplusData } from 'common/hooks/useGetSurplusFiatValue'
import { getExecutedSummaryData } from 'utils/getExecutedSummaryData'

import { OrderLinkWrapper } from '../../pure/commonStyled'
import { OrderSummary } from '../../pure/OrderSummary'
import { OrderSummaryTemplateProps } from '../../pure/OrderSummary/summaryTemplates'
import { OrderSurplusInfo } from '../../pure/OrderSurplusInfo'

function SummaryTemplate({ inputAmount, outputAmount }: OrderSummaryTemplateProps) {
  return (
    <>
      Traded {inputAmount} for a total of {outputAmount}
    </>
  )
}

interface FulfilledOrderNotificationProps {
  uid: string
  chainId: SupportedChainId
  onToastMessage(message: string): void
}

export function FulfilledOrderNotification({ chainId, uid, onToastMessage }: FulfilledOrderNotificationProps) {
  const ref = useCallback(
    (node: HTMLDivElement) => {
      if (node) onToastMessage(node.innerText)
    },
    [onToastMessage]
  )

  const order = useOrder({ chainId, id: uid })
  const surplusData = useGetSurplusData(order)

  const executedData = useMemo(() => {
    return order ? getExecutedSummaryData(order) : null
  }, [order])

  if (!order || !executedData) return null

  const { formattedFilledAmount, formattedSwappedAmount } = executedData

  const tx = {
    hash: uid,
    hashType: HashType.ETHEREUM_TX,
  }

  return (
    <>
      <div ref={ref}>
        <OrderSummary
          kind={order.kind}
          inputToken={formattedFilledAmount.currency as TokenInfo}
          outputToken={formattedSwappedAmount.currency as TokenInfo}
          sellAmount={formattedFilledAmount.quotient.toString()}
          buyAmount={formattedSwappedAmount.quotient.toString()}
          customTemplate={SummaryTemplate}
        />
        <OrderSurplusInfo surplusData={surplusData} />
      </div>
      <OrderLinkWrapper>
        <EnhancedTransactionLink chainId={chainId} tx={tx} />
      </OrderLinkWrapper>
    </>
  )
}
