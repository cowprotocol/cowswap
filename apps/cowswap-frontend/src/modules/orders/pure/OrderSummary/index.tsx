import { ReactElement, ReactNode, useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { isSellOrder } from '@cowprotocol/common-utils'
import { ChainInfo, OrderKind } from '@cowprotocol/cow-sdk'
import { TokenInfo } from '@cowprotocol/types'
import { TokenAmount } from '@cowprotocol/ui'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { BuyForAtMostTemplate, SellForAtLeastTemplate } from './summaryTemplates'

interface OrderSummaryProps {
  actionTitle?: string
  inputToken: TokenInfo
  outputToken: TokenInfo
  sellAmount: string
  buyAmount: string
  kind: OrderKind
  srcChainData?: ChainInfo
  dstChainData?: ChainInfo
  children?: ReactElement | string
  customTemplate?: typeof SellForAtLeastTemplate
}

export function OrderSummary(props: OrderSummaryProps): ReactNode {
  const {
    kind,
    sellAmount,
    buyAmount,
    outputToken,
    inputToken,
    children,
    customTemplate,
    actionTitle,
    srcChainData,
    dstChainData,
  } = props
  const isSell = isSellOrder(kind)
  const isBridgeOrder = srcChainData && dstChainData && srcChainData.id !== dstChainData.id

  const inputAmount = useMemo(() => {
    return CurrencyAmount.fromRawAmount(TokenWithLogo.fromToken(inputToken), sellAmount)
  }, [inputToken, sellAmount])

  const outputAmount = useMemo(() => {
    return CurrencyAmount.fromRawAmount(TokenWithLogo.fromToken(outputToken), buyAmount)
  }, [buyAmount, outputToken])

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

  const summary = customTemplate
    ? customTemplate(templateProps)
    : isSell
      ? SellForAtLeastTemplate(templateProps)
      : BuyForAtMostTemplate(templateProps)

  return (
    <div>
      {summary}
      {children}
    </div>
  )
}
