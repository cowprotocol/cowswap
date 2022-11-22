import React, { useContext, useMemo } from 'react'
import { AlertTriangle } from 'react-feather'
import styled, { ThemeContext } from 'styled-components/macro'
import { Fraction } from '@uniswap/sdk-core'
import { MouseoverTooltipContent } from 'components/Tooltip'
import { useHighFeeWarning } from 'state/swap/hooks'
import TradeGp from 'state/swap/TradeGp'
import { AuxInformationContainer } from 'components/CurrencyInputPanel/CurrencyInputPanelMod'
import useDebounce from 'hooks/useDebounce'
import { StyledInfoIcon } from '@cow/modules/swap/pure/styled'

interface HighFeeContainerProps {
  padding?: string
  margin?: string
  width?: string
  level?: number
}

const WarningCheckboxContainer = styled.span`
  display: flex;
  width: 100%;
  margin: 0 auto;
  font-weight: bold;
  gap: 2px;
  justify-content: center;
  align-items: center;
  border-radius: 16px;
  padding: 0;
  margin: 10px auto;

  > input {
    cursor: pointer;
    margin: 1px 4px 0 0;
  }
`

const WarningContainer = styled(AuxInformationContainer).attrs((props) => ({
  ...props,
  hideInput: true,
}))<HighFeeContainerProps>`
  --warningColor: ${({ theme, level }) =>
    level === HIGH_TIER_FEE
      ? theme.danger
      : level === MEDIUM_TIER_FEE
      ? theme.warning
      : LOW_TIER_FEE
      ? theme.warning
      : theme.info};
  color: ${({ theme }) => theme.text1};
  padding: ${({ padding = '16px' }) => padding};
  width: ${({ width = '100%' }) => width};
  border-radius: 16px;
  margin: ${({ margin = '0 auto 12px auto' }) => margin};
  position: relative;
  z-index: 1;

  &::before {
    content: '';
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    border-radius: inherit;
    background: var(--warningColor);
    opacity: 0.15;
    z-index: -1;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  > div {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 500;

    svg {
      stroke: ${({ theme }) => theme.text1};
    }
  }
`

const ErrorStyledInfoIcon = styled(StyledInfoIcon)`
  color: ${({ theme }) => theme.infoText};
`
const HIGH_TIER_FEE = 30
const MEDIUM_TIER_FEE = 20
const LOW_TIER_FEE = 10

// checks fee as percentage (30% not a decimal)
function _getWarningInfo(feePercentage?: Fraction) {
  if (!feePercentage || feePercentage.lessThan(LOW_TIER_FEE)) {
    return undefined
  } else if (feePercentage.lessThan(MEDIUM_TIER_FEE)) {
    return LOW_TIER_FEE
  } else if (feePercentage.lessThan(HIGH_TIER_FEE)) {
    return MEDIUM_TIER_FEE
  } else {
    return HIGH_TIER_FEE
  }
}

const HighFeeWarningMessage = ({ feePercentage }: { feePercentage?: Fraction }) => (
  <div>
    <small>
      Current fees on this network make up{' '}
      <u>
        <strong>{feePercentage?.toFixed(2)}%</strong>
      </u>{' '}
      of your swap amount.
      <br />
      <br />
      Consider waiting for lower fees.
      <br />
      <br />
      You may still move forward with this swap but a high percentage of it will be consumed by fees.
    </small>
  </div>
)

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

export type WarningProps = {
  trade?: TradeGp
  acceptedStatus?: boolean
  className?: string
  acceptWarningCb?: () => void
  hide?: boolean
} & HighFeeContainerProps

export const HighFeeWarning = (props: WarningProps) => {
  const { acceptedStatus, acceptWarningCb, trade } = props
  const theme = useContext(ThemeContext)

  const { isHighFee, feePercentage } = useHighFeeWarning(trade)
  const [level] = useMemo(() => {
    const level = _getWarningInfo(feePercentage)
    return [level]
  }, [feePercentage])

  if (!isHighFee) return null

  return (
    <WarningContainer {...props} level={level}>
      <div>
        <AlertTriangle size={24} />
        Fees exceed {level}% of the swap amount!{' '}
        <MouseoverTooltipContent
          bgColor={theme.bg1}
          color={theme.text1}
          wrap
          content={<HighFeeWarningMessage feePercentage={feePercentage} />}
        >
          <ErrorStyledInfoIcon />
        </MouseoverTooltipContent>{' '}
      </div>

      {acceptWarningCb && (
        <WarningCheckboxContainer>
          <input id="fees-exceed-checkbox" type="checkbox" onChange={acceptWarningCb} checked={!!acceptedStatus} /> Swap
          anyway
        </WarningCheckboxContainer>
      )}
    </WarningContainer>
  )
}

export const NoImpactWarning = (props: WarningProps) => {
  const { acceptedStatus, acceptWarningCb, hide } = props
  const theme = useContext(ThemeContext)

  const debouncedHide = useDebounce(hide, 2000)

  if (!!debouncedHide) return null

  return (
    <WarningContainer {...props}>
      <div>
        <AlertTriangle size={18} />
        Price impact <strong>unknown</strong> - trade carefully{' '}
        <MouseoverTooltipContent bgColor={theme.bg1} color={theme.text1} content={NoImpactWarningMessage} wrap>
          <ErrorStyledInfoIcon />
        </MouseoverTooltipContent>
        {acceptWarningCb && (
          <WarningCheckboxContainer>
            <input id="price-impact-checkbox" type="checkbox" onChange={acceptWarningCb} checked={!!acceptedStatus} />{' '}
            Swap anyway
          </WarningCheckboxContainer>
        )}
      </div>
    </WarningContainer>
  )
}
