import { TradeWarning, TradeWarningType } from './index'

const text = (
  <span>
    Price impact <strong>unknown</strong> - trade carefully
  </span>
)

const tooltipContent = (
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

const Fixtures = {
  default: () => (
    <TradeWarning type={TradeWarningType.LOW} text={text} tooltipContent={tooltipContent} withoutAccepting={false} />
  ),
}

export default Fixtures
