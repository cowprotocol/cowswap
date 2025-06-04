import { ReactElement } from 'react'

export interface OrderSummaryTemplateProps {
  inputAmount: ReactElement
  outputAmount: ReactElement
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function SellForAtLeastTemplate({ inputAmount, outputAmount }: OrderSummaryTemplateProps) {
  return (
    <>
      Sell {inputAmount} for at least {outputAmount}
    </>
  )
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function BuyForAtMostTemplate({ inputAmount, outputAmount }: OrderSummaryTemplateProps) {
  return (
    <>
      Buy {outputAmount} for at most {inputAmount}
    </>
  )
}
