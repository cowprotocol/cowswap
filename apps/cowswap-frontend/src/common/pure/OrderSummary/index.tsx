import { ReactElement, ReactNode, useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { isSellOrder } from '@cowprotocol/common-utils'
import { ChainInfo, OrderKind } from '@cowprotocol/cow-sdk'
import { TokenInfo } from '@cowprotocol/types'
import { TokenAmount } from '@cowprotocol/ui'
import { CurrencyAmount } from '@uniswap/sdk-core'
import { OrderSummaryTemplateProps } from './summaryTemplates'
import { BuyForAtMostTemplate, SellForAtLeastTemplate } from './summaryTemplates'

import { TradeAmounts } from '../../types'

interface TokensAndAmounts {
  inputToken: TokenInfo
  outputToken: TokenInfo
  sellAmount: string
  buyAmount: string
}

type OrderSummaryProps = {
  actionTitle?: string
  kind: OrderKind
  srcChainData?: ChainInfo
  dstChainData?: ChainInfo
  children?: ReactElement | string
  customTemplate?: React.ComponentType<OrderSummaryTemplateProps>
} & (TradeAmounts | TokensAndAmounts)

export function OrderSummary(props: OrderSummaryProps): ReactNode {
  const { kind, children, customTemplate: CustomTemplateComponent, actionTitle, srcChainData, dstChainData } = props
  const isSell = isSellOrder(kind)
  const isBridgeOrder = srcChainData && dstChainData && srcChainData.id !== dstChainData.id

  const inputAmount = useMemo(() => {
    if ('inputAmount' in props) {
      return props.inputAmount
    }

    return CurrencyAmount.fromRawAmount(TokenWithLogo.fromToken(props.inputToken), props.sellAmount)
  }, [props])

  const outputAmount = useMemo(() => {
    if ('outputAmount' in props) {
      return props.outputAmount
    }

    return CurrencyAmount.fromRawAmount(TokenWithLogo.fromToken(props.outputToken), props.buyAmount)
  }, [props])

  const inputAmountElement = <TokenAmount amount={inputAmount} tokenSymbol={inputAmount?.currency} />
  const outputAmountElement = <TokenAmount amount={outputAmount} tokenSymbol={outputAmount?.currency} />

  const templateProps = {
    inputAmount: inputAmountElement,
    outputAmount: outputAmountElement,
    actionTitle,
    ...(isBridgeOrder && {
      srcChainData,
      dstChainData,
    }),
  }

  const Template =
    CustomTemplateComponent ?? (isSell ? SellForAtLeastTemplate : BuyForAtMostTemplate)

  return (
    <div>
      <Template {...templateProps} />
      {children}
    </div>
  )
}
