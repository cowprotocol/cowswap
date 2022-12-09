import { Currency } from '@uniswap/sdk-core'
import { LOW_RATE_THRESHOLD_PERCENT } from '@cow/modules/limitOrders/const/trade'
import styled from 'styled-components/macro'
import { AlertTriangle } from 'react-feather'

interface RateImpactAcknowledge {
  withAcknowledge: boolean
  isAccepted: boolean
  onAcknowledgeChange(checked: boolean): void
}

export interface RateImpactWarningProps extends Partial<RateImpactAcknowledge> {
  rateImpact: number
  inputCurrency: Currency
  className?: string
}

const RateImpactWarningBox = styled.div<{ withAcknowledge: boolean }>`
  display: flex;
  align-items: center;
  border-radius: ${({ withAcknowledge }) => (withAcknowledge ? '18px 18px 0 0' : '18px')};
  padding: 15px;
  gap: 15px;
  color: ${({ theme }) => (theme.darkMode ? '#ffb7b1' : '#860b00')};
  background: rgba(255, 59, 41, 0.2);
`

const ReadMoreLink = styled.a`
  display: block;
  margin-top: 5px;
  color: ${({ theme }) => (theme.darkMode ? '#ffb7b1' : '#860b00')};
`

const AcknowledgeBox = styled.div`
  color: ${({ theme }) => (theme.darkMode ? '#ffb7b1' : '#860b00')};
  background: rgba(255, 59, 41, 0.4);
  text-align: center;
  padding: 15px 0;
  border-radius: 0 0 18px 18px;

  label {
    cursor: pointer;
  }

  input {
    margin-right: 5px;
  }
`

export function RateImpactWarning({
  withAcknowledge = false,
  onAcknowledgeChange,
  isAccepted,
  rateImpact,
  inputCurrency,
  className,
}: RateImpactWarningProps) {
  const isTooLowRate = rateImpact < LOW_RATE_THRESHOLD_PERCENT

  if (!isTooLowRate) return null

  return (
    <div className={className}>
      <RateImpactWarningBox withAcknowledge={withAcknowledge}>
        <div>
          <AlertTriangle size={32} />
        </div>
        <div>
          Your limit price is {Math.abs(rateImpact)}% lower than current market price. You could be selling your{' '}
          {inputCurrency.symbol} at a loss (although CoW Swap will always try to give you the best price regardless).
          <ReadMoreLink target="_blank" href="https://www.investopedia.com/terms/l/limitorder.asp">
            Read more about limit orders
          </ReadMoreLink>
        </div>
      </RateImpactWarningBox>
      {withAcknowledge && (
        <AcknowledgeBox>
          <label>
            <input
              type="checkbox"
              checked={isAccepted}
              onChange={(event) => onAcknowledgeChange?.(event.target.checked)}
            />
            <span>I acknowledge the high price impact</span>
          </label>
        </AcknowledgeBox>
      )}
    </div>
  )
}
