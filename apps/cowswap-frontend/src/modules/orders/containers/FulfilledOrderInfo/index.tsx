import { ReactNode } from 'react'

import { WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { TokenInfo } from '@cowprotocol/types'
import type { Token as UniToken } from '@uniswap/sdk-core'

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

  // Prefer wrapped native symbol (e.g. WETH) when the address matches the
  // chain's wrapped native token. Some sources may label it as ETH, which is
  // misleading on non-Ethereum chains (e.g. Polygon). This ensures consistency
  // with the rest of the UI and the bridge summary card.
  const wrappedNative = WRAPPED_NATIVE_CURRENCIES[chainId as SupportedChainId]

  const filledCurrency = formattedFilledAmount?.currency
  const swappedCurrency = formattedSwappedAmount?.currency

  type TokenLike = TokenInfo | UniToken

  function toTokenInfo(token: TokenLike | undefined): TokenInfo | undefined {
    if (!token) return undefined
    const { chainId, address, decimals } = token
    const symbol = (token as { symbol?: string }).symbol || ''
    const name = (token as { name?: string }).name || symbol || ''

    return { chainId, address, decimals, symbol, name }
  }

  const isWrapped = (t: TokenLike | undefined): boolean =>
    Boolean(t && wrappedNative && t.address?.toLowerCase() === wrappedNative.address.toLowerCase())

  const inputTokenForSummary = toTokenInfo(isWrapped(filledCurrency) ? wrappedNative : filledCurrency)
  const outputTokenForSummary = toTokenInfo(isWrapped(swappedCurrency) ? wrappedNative : swappedCurrency)

  if (!order) return null

  return (
    <>
      {formattedFilledAmount && formattedSwappedAmount && inputTokenForSummary && outputTokenForSummary && (
        <OrderSummary
          kind={order.kind}
          inputToken={inputTokenForSummary}
          outputToken={outputTokenForSummary}
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
