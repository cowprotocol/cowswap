import { ReactNode } from 'react'

import { isSellOrder } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { TokenInfo } from '@cowprotocol/types'

import { Trans } from '@lingui/react/macro'

import { useOrder } from 'legacy/state/orders/hooks'

import { useGetExecutedBridgeSummary } from 'common/hooks/useGetExecutedBridgeSummary'
import { useGetSurplusData } from 'common/hooks/useGetSurplusFiatValue'

import * as styledEl from './styled'

import { OrderSummary } from '../../pure/OrderSummary'
import { OrderSummaryTemplateProps } from '../../pure/OrderSummary/summaryTemplates'

function FulfilledSummaryTemplate({ inputAmount, outputAmount }: OrderSummaryTemplateProps): ReactNode {
  return (
    <>
      <Trans>
        Traded {inputAmount} for a total of {outputAmount}
      </Trans>
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

  const inputToken = isSellOrder(order.kind) ? order.inputToken : order.outputToken
  const outputToken = isSellOrder(order.kind) ? order.outputToken : order.inputToken

  return (
    <>
      {formattedFilledAmount?.currency && formattedSwappedAmount?.currency && (
        <OrderSummary
          kind={order.kind}
          inputToken={inputToken as TokenInfo}
          outputToken={outputToken as TokenInfo}
          sellAmount={formattedFilledAmount.quotient.toString()}
          buyAmount={formattedSwappedAmount.quotient.toString()}
          customTemplate={FulfilledSummaryTemplate}
        />
      )}
      {!!surplusAmount && (
        <styledEl.SurplusWrapper>
          <span>
            <Trans>Order surplus</Trans>:{' '}
          </span>
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
