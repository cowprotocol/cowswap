import React, { useContext, useMemo } from 'react'
import { AlertTriangle } from 'react-feather'
import styled, { ThemeContext } from 'styled-components/macro'
import { Fraction } from '@uniswap/sdk-core'
import { MouseoverTooltipContent } from 'components/Tooltip'
import { useHighFeeWarning } from 'state/swap/hooks'
import TradeGp from 'state/swap/TradeGp'
import { AuxInformationContainer } from 'components/CurrencyInputPanel/CurrencyInputPanelMod'
import { transparentize, darken } from 'polished'
import useDebounce from 'hooks/useDebounce'
import { StyledInfoIcon } from '@cow/modules/swap/pure/styled'

interface HighFeeContainerProps {
  padding?: string
  margin?: string
  width?: string
  bgColour?: string
  textColour?: string
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
  padding: 16px;
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
  background: ${({ theme, bgColour }) => bgColour || theme.info};
  color: ${({ theme, textColour }) => textColour || theme.infoText};
  padding: ${({ padding = '10px' }) => padding};
  width: ${({ width = '100%' }) => width};
  border-radius: 16px;
  margin: ${({ margin = '0 auto 12px auto' }) => margin};

  ${WarningCheckboxContainer} {
    border: 1px solid ${({ theme, textColour }) => transparentize(0.7, textColour || theme.infoText)};
  }

  > div {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 500;

    svg {
      stroke: ${({ theme, textColour }) => textColour || theme.infoText};
    }
  }
`

const ErrorStyledInfoIcon = styled(StyledInfoIcon)`
  color: ${({ theme }) => theme.infoText};
`
const HIGH_TIER_FEE = { level: '30', colour: '#FF7676' }
const MEDIUM_TIER_FEE = { level: '20', colour: '#FFC7AF' }
const LOW_TIER_FEE = { level: '10', colour: '#FFEDAF' }

// checks fee as percentage (30% not a decimal)
function _getWarningInfo(feePercentage?: Fraction) {
  if (!feePercentage || feePercentage.lessThan(LOW_TIER_FEE.level)) {
    return { colour: undefined, level: undefined }
  } else if (feePercentage.lessThan(MEDIUM_TIER_FEE.level)) {
    return LOW_TIER_FEE
  } else if (feePercentage.lessThan(HIGH_TIER_FEE.level)) {
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
  const [bgColour, textColour, level] = useMemo(() => {
    const { colour: baseColour, level } = _getWarningInfo(feePercentage)
    return [baseColour, baseColour && darken(0.7, baseColour), level]
  }, [feePercentage])

  if (!isHighFee) return null

  return (
    <WarningContainer {...props} bgColour={bgColour} textColour={textColour}>
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
  const [bgColour, textColour] = [LOW_TIER_FEE.colour, darken(0.7, HIGH_TIER_FEE.colour)]

  if (!!debouncedHide) return null

  return (
    <WarningContainer {...props} bgColour={bgColour} textColour={textColour}>
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
