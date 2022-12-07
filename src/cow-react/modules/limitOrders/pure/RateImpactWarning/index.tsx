import { Currency } from '@uniswap/sdk-core'
import { LOW_RATE_THRESHOLD_PERCENT } from '@cow/modules/limitOrders/const/trade'
import styled from 'styled-components/macro'
import { AlertTriangle } from 'react-feather'
import { useIsDarkMode } from 'state/user/hooks'

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

const RateImpactWarningBox = styled.div<{ withAcknowledge: boolean; darkMode: boolean }>`
  display: flex;
  align-items: center;
  border-radius: ${({ withAcknowledge }) => (withAcknowledge ? '18px 18px 0 0' : '18px')};
  padding: 15px;
  gap: 15px;
  color: ${({ darkMode }) => (darkMode ? '#ffb7b1' : '#860b00')};
  background: rgba(255, 59, 41, 0.2);
`

const ReadMoreLink = styled.a<{ darkMode: boolean }>`
  display: block;
  margin-top: 5px;
  color: ${({ darkMode }) => (darkMode ? '#ffb7b1' : '#860b00')};
`

const AcknowledgeBox = styled.div<{ darkMode: boolean }>`
  color: ${({ darkMode }) => (darkMode ? '#ffb7b1' : '#860b00')};
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
  const darkMode = useIsDarkMode()
  const isTooLowRate = rateImpact < LOW_RATE_THRESHOLD_PERCENT

  if (!isTooLowRate) return null

  return (
    <div className={className}>
      <RateImpactWarningBox darkMode={darkMode} withAcknowledge={withAcknowledge}>
        <div>
          <AlertTriangle size={32} />
        </div>
        <div>
          Your limit price is {Math.abs(rateImpact)}% lower than current market price. You will be selling your{' '}
          {inputCurrency.symbol} at a loss!
          <ReadMoreLink darkMode={darkMode} href="TODO">
            Read more about limit orders
          </ReadMoreLink>
        </div>
      </RateImpactWarningBox>
      {withAcknowledge && (
        <AcknowledgeBox darkMode={darkMode}>
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
