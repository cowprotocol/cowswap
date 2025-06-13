import { ReactElement, useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { isSellOrder } from '@cowprotocol/common-utils'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { TokenInfo } from '@cowprotocol/types'
import { TokenAmount } from '@cowprotocol/ui'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { BuyForAtMostTemplate, SellForAtLeastTemplate } from './summaryTemplates'

interface OrderSummaryProps {
  inputToken: TokenInfo
  outputToken: TokenInfo
  sellAmount: string
  buyAmount: string
  kind: OrderKind
  children?: ReactElement | string
  customTemplate?: typeof SellForAtLeastTemplate
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function OrderSummary(props: OrderSummaryProps) {
  const { kind, sellAmount, buyAmount, outputToken, inputToken, children, customTemplate } = props
  const isSell = isSellOrder(kind)

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
