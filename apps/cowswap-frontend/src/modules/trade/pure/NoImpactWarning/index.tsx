import { TradeWarning, TradeWarningType } from 'modules/trade/pure/TradeWarning'

const NoImpactWarningMessage = (
  <div>
    <small>
      We are unable to calculate the price impact for this order.
      <br />
      <br />
      You may still move forward but{' '}
      <strong>please review carefully that the receive amounts are what you expect.</strong>
    </small>
  </div>
)

export interface NoImpactWarningProps {
  isAccepted: boolean
  withoutAccepting?: boolean
  className?: string
  acceptCallback?(): void
}

export function NoImpactWarning(props: NoImpactWarningProps) {
  const { acceptCallback, isAccepted, withoutAccepting, className } = props

  return (
    <TradeWarning
      type={TradeWarningType.LOW}
      className={className}
      withoutAccepting={withoutAccepting}
      isAccepted={isAccepted}
      tooltipContent={NoImpactWarningMessage}
      acceptCallback={acceptCallback}
      text={
        <span>
          Price impact <strong>unknown</strong> - trade carefully
        </span>
      }
    />
  )
}
