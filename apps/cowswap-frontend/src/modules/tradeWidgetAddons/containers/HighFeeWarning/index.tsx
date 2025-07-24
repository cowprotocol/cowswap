import { useCallback, useMemo } from 'react'

import { BannerOrientation, InfoTooltip, InlineBanner, StatusColorVariant } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Fraction, Rounding } from '@uniswap/sdk-core'

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

export function HighFeeWarning({ readonlyMode }: HighFeeWarningProps): React.ReactNode | null {
  const { account } = useWalletInfo()
  const { isHighFee, feePercentage, feeWarningAccepted, setFeeWarningAccepted, isHighBridgeFee, bridgeFeePercentage } =
    useHighFeeWarning()

  const toggleSwapFeeWarningAccepted = useCallback(() => {
    setFeeWarningAccepted((state: boolean) => !state)
  }, [setFeeWarningAccepted])

  const swapLevel = useSafeMemo(() => {
    const swapLevel = _getWarningInfo(feePercentage)
    const bridgeLevel = _getWarningInfo(bridgeFeePercentage)
    if (swapLevel && bridgeLevel) {
      return Math.max(swapLevel, bridgeLevel)
    }

    if (swapLevel) {
      return swapLevel
    }
    return bridgeLevel
  }, [feePercentage, bridgeFeePercentage])

  const textContent = useMemo(
    () => getHighFeeWarningMessageContent({ isHighFee, isHighBridgeFee, feePercentage, bridgeFeePercentage }),
    [isHighFee, isHighBridgeFee, feePercentage, bridgeFeePercentage],
  )

  const hasExtraContent = account && !readonlyMode

  return textContent ? (
    <InlineBanner
      bannerType={swapLevel ? BannerTypeMap[swapLevel] : StatusColorVariant.Info}
      orientation={hasExtraContent ? BannerOrientation.Vertical : BannerOrientation.Horizontal}
      noWrapContent
      width="100%"
      customContent={
        hasExtraContent && (
          <InlineWarningCheckboxContainer>
            <input
              id="fees-exceed-checkbox"
              type="checkbox"
              onChange={toggleSwapFeeWarningAccepted}
              checked={feeWarningAccepted}
            />{' '}
            Swap anyway
          </InlineWarningCheckboxContainer>
        )
      }
    >
      {textContent}
      <InfoTooltip
        size={24}
        content={<HighFeeWarningMessage feePercentage={feePercentage} bridgeFeePercentage={bridgeFeePercentage} />}
      />
    </InlineBanner>
  ) : null
}

// checks fee as percentage (30% not a decimal)
function _getWarningInfo(feePercentage?: Fraction): 30 | 20 | 10 | undefined {
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

const formatFeePercentage = (feePercentage: Fraction | undefined): string => {
  return feePercentage?.toSignificant(2, undefined, Rounding.ROUND_DOWN) ?? '0'
}

const getHighFeeWarningMessageContent = ({
  isHighFee,
  isHighBridgeFee,
  feePercentage,
  bridgeFeePercentage,
}: {
  isHighFee: boolean
  isHighBridgeFee?: boolean
  feePercentage?: Fraction
  bridgeFeePercentage?: Fraction
}): string | null => {
  if (isHighFee && isHighBridgeFee) {
    return feePercentage === bridgeFeePercentage
      ? `The costs are at least ${formatFeePercentage(feePercentage)}% of the swap and bridge amount`
      : `The costs are at least ${formatFeePercentage(feePercentage)}% of the swap amount and ${formatFeePercentage(bridgeFeePercentage)}% of the bridge amount`
  }

  if (isHighFee) {
    return `The costs are at least ${formatFeePercentage(feePercentage)}% of the swap amount`
  }

  if (isHighBridgeFee) {
    return `The costs are at least ${formatFeePercentage(bridgeFeePercentage)}% of the bridge amount`
  }

  return null
}

const HighFeeWarningMessage = ({
  feePercentage,
  bridgeFeePercentage,
}: {
  feePercentage?: Fraction
  bridgeFeePercentage?: Fraction
}): React.ReactNode => {
  return (
    <div>
      <small>
        Current network costs make up{' '}
        <u>
          <strong>{feePercentage?.toFixed(2)}%</strong>
        </u>{' '}
        of your swap amount.
        <br />
        {bridgeFeePercentage && (
          <>
            <br />
            Current bridge costs make up{' '}
            <u>
              <strong>{bridgeFeePercentage?.toFixed(2)}%</strong>
            </u>{' '}
            of your bridge amount.
            <br />
          </>
        )}
        <br />
        Consider waiting for lower network costs.
        <br />
        <br />
        You may still move forward with this swap but a high percentage of it will be consumed by network costs.
      </small>
    </div>
  )
}
