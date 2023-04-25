import React, { useContext, useMemo } from 'react'
import { AlertTriangle } from 'react-feather'
import styled, { ThemeContext } from 'styled-components/macro'
import { Fraction } from '@uniswap/sdk-core'
import { MouseoverTooltipContent } from 'components/Tooltip'
import { useHighFeeWarning } from 'state/swap/hooks'
import TradeGp from 'state/swap/TradeGp'
import { AuxInformationContainer } from 'components/CurrencyInputPanel/CurrencyInputPanelMod'
import { StyledInfoIcon } from '@cow/modules/swap/pure/styled'
import { useIsDarkMode } from 'state/user/hooks'

interface HighFeeContainerProps {
  padding?: string
  margin?: string
  width?: string
  level?: number
  isDarkMode?: boolean
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
      ? theme.alert
      : theme.info};
  color: ${({ theme }) => theme.text1};
  padding: ${({ padding = '16px' }) => padding};
  width: ${({ width = '100%' }) => width};
  border-radius: 16px;
  border: 0;
  margin: ${({ margin = '0 auto 12px auto' }) => margin};
  position: relative;
  z-index: 1;

  &:hover {
    border: 0;
  }

  &::before {
    content: '';
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    border-radius: inherit;
    background: var(--warningColor);
    opacity: ${({ isDarkMode }) => (isDarkMode ? 0.2 : 0.15)};
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
    text-align: center;

    > svg:first-child {
      stroke: var(--warningColor);
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
  const darkMode = useIsDarkMode()

  const { isHighFee, feePercentage } = useHighFeeWarning(trade)
  const [level] = useMemo(() => {
    const level = _getWarningInfo(feePercentage)
    return [level]
  }, [feePercentage])

  if (!isHighFee) return null

  return (
    <WarningContainer {...props} level={level} isDarkMode={darkMode}>
      <div>
        <AlertTriangle size={24} />
        Fees exceed {level}% of the swap amount!{' '}
        <MouseoverTooltipContent
          bgColor={theme.bg3}
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
