import { Command } from '@cowprotocol/types'
import { HoverTooltip } from '@cowprotocol/ui'
import { Fraction } from '@uniswap/sdk-core'

import { AlertTriangle } from 'react-feather'

import { useIsDarkMode } from 'legacy/state/user/hooks'

import { useHighFeeWarning } from 'modules/trade'

import { useSafeMemo } from 'common/hooks/useSafeMemo'

import { HIGH_TIER_FEE, LOW_TIER_FEE, MEDIUM_TIER_FEE } from './consts'
import { ErrorStyledInfoIcon, HighFeeContainerProps, WarningCheckboxContainer, WarningContainer } from './styled'

export type WarningProps = {
  acceptedStatus?: boolean
  className?: string
  acceptWarningCb?: Command
  hide?: boolean
} & HighFeeContainerProps

export const HighFeeWarning = (props: WarningProps) => {
  const { acceptedStatus, acceptWarningCb } = props
  const darkMode = useIsDarkMode()

  const { isHighFee, feePercentage } = useHighFeeWarning()
  const level = useSafeMemo(() => _getWarningInfo(feePercentage), [feePercentage])

  if (!isHighFee) return null

  return (
    <WarningContainer {...props} level={level} isDarkMode={darkMode}>
      <div>
        <AlertTriangle size={24} />
        Costs exceed {level}% of the swap amount!{' '}
        <HoverTooltip wrapInContainer content={<HighFeeWarningMessage feePercentage={feePercentage} />}>
          <ErrorStyledInfoIcon />
        </HoverTooltip>{' '}
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
      Current network costs make up{' '}
      <u>
        <strong>{feePercentage?.toFixed(2)}%</strong>
      </u>{' '}
      of your swap amount.
      <br />
      <br />
      Consider waiting for lower network costs.
      <br />
      <br />
      You may still move forward with this swap but a high percentage of it will be consumed by network costs.
    </small>
  </div>
)
