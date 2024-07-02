export interface OrderSummaryTemplateProps {
  inputAmount: JSX.Element
  outputAmount: JSX.Element
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
