import { Currency } from '@uniswap/sdk-core'

import { transparentize, lighten, darken } from 'polished'
import { AlertTriangle } from 'react-feather'
import styled from 'styled-components/macro'

import { LOW_RATE_THRESHOLD_PERCENT } from 'modules/limitOrders/const/trade'

import { UI } from 'common/constants/theme'
import { TokenSymbol } from 'common/pure/TokenSymbol'

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
  padding: 16px;
  gap: 16px;
  color: ${({ theme }) => (theme.darkMode ? lighten(0.2, theme.danger) : darken(0.05, theme.danger))};
  background: ${({ theme }) =>
    theme.darkMode ? transparentize(0.8, theme.danger) : transparentize(0.85, theme.danger)};
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
`

const ReadMoreLink = styled.a`
  display: block;
  color: inherit;
  margin: 16px 0 0;
  text-decoration: underline;

  &:hover {
    color: var(${UI.COLOR_TEXT1});
  }
`

const AcknowledgeBox = styled.div`
  color: ${({ theme }) => (theme.darkMode ? lighten(0.2, theme.danger) : darken(0.05, theme.danger))};
  background: ${({ theme }) =>
    theme.darkMode ? transparentize(0.8, theme.danger) : transparentize(0.85, theme.danger)};
  text-align: center;
  padding: 16px 0;
  border-radius: 0 0 16px 16px;

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
          <TokenSymbol token={inputCurrency} /> at a loss (although CoW Swap will always try to give you the best price
          regardless).
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
