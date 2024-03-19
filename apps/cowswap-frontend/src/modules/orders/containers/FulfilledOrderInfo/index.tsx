import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { TokenInfo } from '@cowprotocol/types'

import { useOrder } from 'legacy/state/orders/hooks'

import { useGetSurplusData } from 'common/hooks/useGetSurplusFiatValue'
import { getExecutedSummaryData } from 'utils/getExecutedSummaryData'

import * as styledEl from './styled'

import { OrderSummary } from '../../pure/OrderSummary'
import { OrderSummaryTemplateProps } from '../../pure/OrderSummary/summaryTemplates'

function FulfilledSummaryTemplate({ inputAmount, outputAmount }: OrderSummaryTemplateProps) {
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

export function FulfilledOrderInfo({ chainId, orderUid }: ExecutedSummaryProps) {
  const order = useOrder({ chainId, id: orderUid })
  const surplusData = useGetSurplusData(order)

  const { surplusFiatValue, showFiatValue, surplusToken, surplusAmount } = surplusData

  if (!order) return null

  const { formattedFilledAmount, formattedSwappedAmount } = getExecutedSummaryData(order)

  return (
    <>
      <OrderSummary
        kind={order.kind}
        inputToken={formattedFilledAmount.currency as TokenInfo}
        outputToken={formattedSwappedAmount.currency as TokenInfo}
        sellAmount={formattedFilledAmount.quotient.toString()}
        buyAmount={formattedSwappedAmount.quotient.toString()}
        customTemplate={FulfilledSummaryTemplate}
      />
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
