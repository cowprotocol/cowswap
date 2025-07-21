import { ReactElement, ReactNode } from 'react'

export interface OrderSummaryTemplateProps {
  inputAmount: ReactElement
  outputAmount: ReactElement
  actionTitle?: string
}

export function SellForAtLeastTemplate({
  inputAmount,
  outputAmount,
  actionTitle = 'Sell',
}: OrderSummaryTemplateProps): ReactNode {
  return (
    <>
      {actionTitle} {inputAmount} for at least {outputAmount}
    </>
  )
}

export function BuyForAtMostTemplate({
  inputAmount,
  outputAmount,
  actionTitle = 'Buy',
}: OrderSummaryTemplateProps): ReactNode {
  return (
    <>
      {actionTitle} {outputAmount} for at most {inputAmount}
    </>
  )
}
