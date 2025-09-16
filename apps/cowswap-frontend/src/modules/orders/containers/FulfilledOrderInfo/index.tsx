import { ReactNode } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { TokenInfo } from '@cowprotocol/types'

import { useOrder } from 'legacy/state/orders/hooks'

import { useGetExecutedBridgeSummary } from 'common/hooks/useGetExecutedBridgeSummary'
import { useGetSurplusData } from 'common/hooks/useGetSurplusFiatValue'

import * as styledEl from './styled'

import { OrderSummary } from '../../pure/OrderSummary'
import { OrderSummaryTemplateProps } from '../../pure/OrderSummary/summaryTemplates'

function FulfilledSummaryTemplate({ inputAmount, outputAmount }: OrderSummaryTemplateProps): ReactNode {
  return (
    <>
      Traded {inputAmount} for a total of {outputAmount}
    </>
  )
}

interface ExecutedSummaryProps {
  chainId: SupportedChainId
  orderUid: string
}

export function FulfilledOrderInfo({ chainId, orderUid }: ExecutedSummaryProps): ReactNode {
  const order = useOrder({ chainId, id: orderUid })
  const surplusData = useGetSurplusData(order)

  const { surplusFiatValue, showFiatValue, surplusToken, surplusAmount } = surplusData

  const { formattedFilledAmount, formattedSwappedAmount } = useGetExecutedBridgeSummary(order) || {}

  if (!order) return null

  return (
    <>
      {formattedFilledAmount?.currency && formattedSwappedAmount?.currency && (
        <OrderSummary
          kind={order.kind}
          inputToken={formattedFilledAmount.currency as TokenInfo}
          outputToken={formattedSwappedAmount.currency as TokenInfo}
          sellAmount={formattedFilledAmount.quotient.toString()}
          buyAmount={formattedSwappedAmount.quotient.toString()}
          customTemplate={FulfilledSummaryTemplate}
        />
      )}
      {!!surplusAmount && (
        <styledEl.SurplusWrapper>
          <span>Order surplus: </span>
          <styledEl.SurplusAmount>
            <styledEl.StyledTokenAmount amount={surplusAmount} tokenSymbol={surplusToken} />
            {showFiatValue && (
              <styledEl.FiatWrapper>
                (<styledEl.StyledFiatAmount amount={surplusFiatValue} />)
              </styledEl.FiatWrapper>
            )}
          </styledEl.SurplusAmount>
        </styledEl.SurplusWrapper>
      )}
    </>
  )
}
