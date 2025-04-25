import { ReactElement } from 'react'

export interface OrderSummaryTemplateProps {
  inputAmount: ReactElement
  outputAmount: ReactElement
}

export function SellForAtLeastTemplate({ inputAmount, outputAmount }: OrderSummaryTemplateProps) {
  return (
    <>
      Sell {inputAmount} for at least {outputAmount}
    </>
  )
}

export function BuyForAtMostTemplate({ inputAmount, outputAmount }: OrderSummaryTemplateProps) {
  return (
    <>
      Buy {outputAmount} for at most {inputAmount}
    </>
  )
}
