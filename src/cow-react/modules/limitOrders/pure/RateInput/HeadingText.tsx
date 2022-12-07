import { RateImpactIndicator } from '@cow/modules/limitOrders/pure/RateImpactIndicator'

type Props = {
  currency: string | undefined
  rateImpact: number
}

export function HeadingText({ currency, rateImpact }: Props) {
  if (!currency) {
    return <span>Select input and output</span>
  }

  return (
    <span>
      Price per {currency}
      {<RateImpactIndicator rateImpact={rateImpact} />}
    </span>
  )
}
