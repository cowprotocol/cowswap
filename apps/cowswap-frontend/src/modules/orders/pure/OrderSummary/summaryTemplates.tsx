import { ReactElement, ReactNode } from 'react'

export interface OrderSummaryTemplateProps {
  inputAmount: ReactElement
  outputAmount: ReactElement
}

export function SellForAtLeastTemplate({ inputAmount, outputAmount }: OrderSummaryTemplateProps): ReactNode {
  return (
    <>
      Sell {inputAmount} for at least {outputAmount}
    </>
  )
}

export function BuyForAtMostTemplate({ inputAmount, outputAmount }: OrderSummaryTemplateProps): ReactNode {
  return (
    <>
      Buy {outputAmount} for at most {inputAmount}
    </>
  )
}
