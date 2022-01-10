import React, { useContext, useMemo } from 'react'
import { AlertTriangle } from 'react-feather'
import styled, { ThemeContext } from 'styled-components/macro'
import { Fraction } from '@uniswap/sdk-core'
import { MouseoverTooltipContent } from 'components/Tooltip'
import { StyledInfo } from 'pages/Swap/styleds'
import { useHighFeeWarning } from 'state/swap/hooks'
import TradeGp from 'state/swap/TradeGp'
import { AuxInformationContainer } from 'components/CurrencyInputPanel'
import { darken } from 'polished'
import useDebounce from 'hooks/useDebounce'

interface HighFeeContainerProps {
  padding?: string
  margin?: string
  width?: string
  bgColour?: string
  textColour?: string
}

const WarningCheckboxContainer = styled.div`
  display: flex;
  font-weight: bold;
  gap: 2px;
  justify-content: center;
  align-items: center;
`

const WarningContainer = styled(AuxInformationContainer).attrs((props) => ({
  ...props,
  hideInput: true,
}))<HighFeeContainerProps>`
  background: ${({ theme, bgColour }) => bgColour || theme.info};
  color: ${({ theme, textColour }) => textColour || theme.infoText};

  padding: ${({ padding = '5px 12px' }) => padding};
  width: ${({ width = '100%' }) => width};
  border-radius: 7px;
  margin: ${({ margin = '0 auto 12px auto' }) => margin};

  > div {
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    gap: 5px;

    font-size: 13px;
    font-weight: 500;

    svg {
      &:first-child {
        margin-right: 5px;
      }
      stroke: ${({ theme, textColour }) => textColour || theme.infoText};
    }

    > ${WarningCheckboxContainer} {
      font-size: 10px;
      margin-left: auto;
      min-width: max-content;

      > input {
        cursor: pointer;
        margin: 1px 4px 0 0;
      }
    }
  }
`

const ErrorStyledInfo = styled(StyledInfo)`
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
        <AlertTriangle size={18} />
        <div>Fees exceed {level}% of the swap amount!</div>{' '}
        <MouseoverTooltipContent
          bgColor={theme.bg1}
          color={theme.text1}
          content={<HighFeeWarningMessage feePercentage={feePercentage} />}
        >
          <ErrorStyledInfo />
        </MouseoverTooltipContent>
        {acceptWarningCb && (
          <WarningCheckboxContainer>
            <input type="checkbox" onChange={acceptWarningCb} checked={!!acceptedStatus} /> Swap anyway
          </WarningCheckboxContainer>
        )}
      </div>
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
        <div>
          Price impact <strong>unknown</strong> - trade carefully
        </div>{' '}
        <MouseoverTooltipContent bgColor={theme.bg1} color={theme.text1} content={NoImpactWarningMessage}>
          <ErrorStyledInfo />
        </MouseoverTooltipContent>
        {acceptWarningCb && (
          <WarningCheckboxContainer>
            <input type="checkbox" onChange={acceptWarningCb} checked={!!acceptedStatus} /> Swap anyway
          </WarningCheckboxContainer>
        )}
      </div>
    </WarningContainer>
  )
}
