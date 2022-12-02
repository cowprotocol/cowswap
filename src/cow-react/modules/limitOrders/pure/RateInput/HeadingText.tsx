import { RateImpactIndicator } from '@cow/modules/limitOrders/pure/RateImpactIndicator'
import { Currency } from '@uniswap/sdk-core'

type Props = {
  currency: string | undefined
  inputCurrency: Currency | null
  rateImpact: number
}

export function HeadingText({ inputCurrency, currency, rateImpact }: Props) {
  if (!currency) {
    return <span>Select input and output</span>
  }

  return (
    <span>
      Price per {currency}
      {<RateImpactIndicator inputCurrency={inputCurrency} rateImpact={rateImpact} />}
    </span>
  )
}
