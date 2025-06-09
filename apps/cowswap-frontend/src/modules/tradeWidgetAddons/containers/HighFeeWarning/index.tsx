import { useCallback } from 'react'

import { HoverTooltip } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Fraction } from '@uniswap/sdk-core'

import { AlertTriangle } from 'react-feather'

import { useIsDarkMode } from 'legacy/state/user/hooks'

import { useSafeMemo } from 'common/hooks/useSafeMemo'

import { HIGH_TIER_FEE, LOW_TIER_FEE, MEDIUM_TIER_FEE } from './consts'
import { useHighFeeWarning } from './hooks/useHighFeeWarning'
import { ErrorStyledInfoIcon, WarningCheckboxContainer, WarningContainer } from './styled'

interface HighFeeWarningProps {
  readonlyMode?: boolean
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function HighFeeWarning({ readonlyMode }: HighFeeWarningProps) {
  const { account } = useWalletInfo()
  const { feeWarningAccepted, setFeeWarningAccepted } = useHighFeeWarning()
  const darkMode = useIsDarkMode()

  const toggleFeeWarningAccepted = useCallback(() => {
    setFeeWarningAccepted((state) => !state)
  }, [setFeeWarningAccepted])

  const { isHighFee, feePercentage } = useHighFeeWarning()
  const level = useSafeMemo(() => _getWarningInfo(feePercentage), [feePercentage])

  if (!isHighFee) return null

  return (
    <WarningContainer level={level} isDarkMode={darkMode}>
      <div>
        <AlertTriangle size={24} />
        Costs exceed {level}% of the swap amount!{' '}
        <HoverTooltip wrapInContainer content={<HighFeeWarningMessage feePercentage={feePercentage} />}>
          <ErrorStyledInfoIcon />
        </HoverTooltip>{' '}
      </div>

      {account && !readonlyMode && (
        <WarningCheckboxContainer>
          <input
            id="fees-exceed-checkbox"
            type="checkbox"
            onChange={toggleFeeWarningAccepted}
            checked={feeWarningAccepted}
          />{' '}
          Swap anyway
        </WarningCheckboxContainer>
      )}
    </WarningContainer>
  )
}

// checks fee as percentage (30% not a decimal)
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
