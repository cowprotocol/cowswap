import { useCallback } from 'react'

import { BannerOrientation, InfoTooltip, InlineBanner, StatusColorVariant } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Fraction } from '@uniswap/sdk-core'

import { useSafeMemo } from 'common/hooks/useSafeMemo'

import { HIGH_TIER_FEE, LOW_TIER_FEE, MEDIUM_TIER_FEE } from './consts'
import { useHighFeeWarning } from './hooks/useHighFeeWarning'
import { InlineWarningCheckboxContainer } from './styled'

interface HighFeeWarningProps {
  readonlyMode?: boolean
}

const BannerTypeMap: Record<number, StatusColorVariant> = {
  [HIGH_TIER_FEE]: StatusColorVariant.Danger,
  [MEDIUM_TIER_FEE]: StatusColorVariant.Warning,
  [LOW_TIER_FEE]: StatusColorVariant.Alert,
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function HighFeeWarning({ readonlyMode }: HighFeeWarningProps) {
  const { account } = useWalletInfo()
  const { feeWarningAccepted, setFeeWarningAccepted } = useHighFeeWarning()

  const toggleFeeWarningAccepted = useCallback(() => {
    setFeeWarningAccepted((state) => !state)
  }, [setFeeWarningAccepted])

  const { isHighFee, feePercentage } = useHighFeeWarning()
  const level = useSafeMemo(() => _getWarningInfo(feePercentage), [feePercentage])

  if (!isHighFee) return null

  return (
    <>
      <InlineBanner
        bannerType={level ? BannerTypeMap[level] : StatusColorVariant.Info}
        orientation={BannerOrientation.Vertical}
        noWrapContent
        width="100%"
        customContent={
          account &&
          !readonlyMode && (
            <InlineWarningCheckboxContainer>
              <input
                id="fees-exceed-checkbox"
                type="checkbox"
                onChange={toggleFeeWarningAccepted}
                checked={feeWarningAccepted}
              />{' '}
              Swap anyway
            </InlineWarningCheckboxContainer>
          )
        }
      >
        Costs exceed {level}% of the swap amount
        <InfoTooltip size={24} content={<HighFeeWarningMessage feePercentage={feePercentage} />} />
      </InlineBanner>

      <InlineBanner
        bannerType={level ? BannerTypeMap[level] : StatusColorVariant.Info}
        orientation={BannerOrientation.Vertical}
        noWrapContent
        width="100%"
        customContent={
          account &&
          !readonlyMode && (
            <InlineWarningCheckboxContainer>
              <input
                id="fees-exceed-checkbox"
                type="checkbox"
                onChange={toggleFeeWarningAccepted}
                checked={feeWarningAccepted}
              />{' '}
              Swap anyway
            </InlineWarningCheckboxContainer>
          )
        }
      >
        Costs exceed {level}% of the bridge amount
        <InfoTooltip size={24} content={<HighFeeWarningMessage feePercentage={feePercentage} />} />
      </InlineBanner>
    </>
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
