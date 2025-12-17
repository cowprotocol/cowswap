import { useCallback, useMemo } from 'react'

import { BannerOrientation, InfoTooltip, InlineBanner, StatusColorVariant } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Trans } from '@lingui/react/macro'

import { useSafeMemo } from 'common/hooks/useSafeMemo'

import { HIGH_TIER_FEE, LOW_TIER_FEE, MEDIUM_TIER_FEE } from './consts'
import { _getWarningInfo, getHighFeeWarningMessageContent } from './highFeeWarningHelpers'
import { HighFeeWarningTooltipContent } from './HighFeeWarningTooltipContent'
import { useHighFeeWarning } from './hooks/useHighFeeWarning'
import { InlineWarningCheckboxContainer, InlineWarningTextContainer } from './styled'

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
            <Trans>Swap anyway</Trans>
          </InlineWarningCheckboxContainer>
        )
      }
    >
      <InlineWarningTextContainer>{textContent}</InlineWarningTextContainer>
      <InfoTooltip
        size={24}
        content={
          <HighFeeWarningTooltipContent
            feePercentage={feePercentage}
            isHighFee={isHighFee}
            isHighBridgeFee={isHighBridgeFee}
            bridgeFeePercentage={bridgeFeePercentage}
          />
        }
      />
    </InlineBanner>
  ) : null
}
