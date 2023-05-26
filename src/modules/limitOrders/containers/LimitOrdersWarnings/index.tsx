import React, { useCallback, useEffect } from 'react'

import { RateImpactWarning } from '../../pure/RateImpactWarning'
import { NoImpactWarning } from 'modules/trade/pure/NoImpactWarning'
import { useAtomValue } from 'jotai/utils'
import {
  limitOrdersWarningsAtom,
  updateLimitOrdersWarningsAtom,
} from 'modules/limitOrders/state/limitOrdersWarningsAtom'
import { useRateImpact } from 'modules/limitOrders/hooks/useRateImpact'
import { useLimitOrdersDerivedState } from 'modules/limitOrders/hooks/useLimitOrdersDerivedState'
import { limitOrdersSettingsAtom } from 'modules/limitOrders/state/limitOrdersSettingsAtom'
import { useSetAtom } from 'jotai'
import { PriceImpact } from 'legacy/hooks/usePriceImpact'
import styled from 'styled-components/macro'
import { LimitOrdersFormState, useLimitOrdersFormState } from 'modules/limitOrders/hooks/useLimitOrdersFormState'
import { isFractionFalsy } from 'utils/isFractionFalsy'
import { useIsSafeViaWc, useWalletInfo } from 'modules/wallet'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import {
  BundleTxApprovalBanner,
  BundleTxSafeWcBanner,
  SmallVolumeWarningBanner,
} from 'common/pure/InlineBanner/banners'
import { HIGH_FEE_WARNING_PERCENTAGE } from 'modules/limitOrders/pure/Orders/OrderRow/EstimatedExecutionPrice'
import { calculatePercentageInRelationToReference } from 'modules/limitOrders/utils/calculatePercentageInRelationToReference'
import { Nullish } from 'types'
import { ZeroApprovalWarning } from 'common/pure/ZeroApprovalWarning'
import { useShouldZeroApprove } from 'common/hooks/useShouldZeroApprove'

const FORM_STATES_TO_SHOW_BUNDLE_BANNER = [
  LimitOrdersFormState.ExpertApproveAndSwap,
  LimitOrdersFormState.ApproveAndSwap,
]

export interface LimitOrdersWarningsProps {
  priceImpact: PriceImpact
  feeAmount?: Nullish<CurrencyAmount<Currency>>
  isConfirmScreen?: boolean
  className?: string
}

const StyledNoImpactWarning = styled(NoImpactWarning)`
  margin: 10px auto 0;
`
const StyledRateImpactWarning = styled(RateImpactWarning)`
  margin: 10px auto 0;
`

export function LimitOrdersWarnings(props: LimitOrdersWarningsProps) {
  const { priceImpact, feeAmount, isConfirmScreen = false, className } = props

  const { isPriceImpactAccepted, isRateImpactAccepted } = useAtomValue(limitOrdersWarningsAtom)
  const updateLimitOrdersWarnings = useSetAtom(updateLimitOrdersWarningsAtom)
  const { expertMode } = useAtomValue(limitOrdersSettingsAtom)

  const formState = useLimitOrdersFormState()
  const rateImpact = useRateImpact()
  const { chainId, account } = useWalletInfo()
  const { slippageAdjustedSellAmount, inputCurrency, inputCurrencyAmount, outputCurrency, outputCurrencyAmount } =
    useLimitOrdersDerivedState()

  const showPriceImpactWarning =
    !!chainId && !expertMode && !!account && !!priceImpact.error && formState === LimitOrdersFormState.CanTrade

  const feePercentage = calculatePercentageInRelationToReference({ value: feeAmount, reference: inputCurrencyAmount })

  const showHighFeeWarning = feePercentage?.greaterThan(HIGH_FEE_WARNING_PERCENTAGE)

  const showApprovalBundlingBanner = !isConfirmScreen && FORM_STATES_TO_SHOW_BUNDLE_BANNER.includes(formState)
  const shouldZeroApprove = useShouldZeroApprove(slippageAdjustedSellAmount)
  const showZeroApprovalWarning = shouldZeroApprove && outputCurrency !== null // Show warning only when output currency is also present.

  const isSafeViaWc = useIsSafeViaWc()
  const showSafeWcBundlingBanner =
    !isConfirmScreen && !showApprovalBundlingBanner && isSafeViaWc && formState === LimitOrdersFormState.NotApproved

  const isVisible =
    showPriceImpactWarning ||
    rateImpact < 0 ||
    showHighFeeWarning ||
    showApprovalBundlingBanner ||
    showSafeWcBundlingBanner ||
    shouldZeroApprove

  // Reset price impact flag when there is no price impact
  useEffect(() => {
    updateLimitOrdersWarnings({ isPriceImpactAccepted: !showPriceImpactWarning })
  }, [showPriceImpactWarning, updateLimitOrdersWarnings])

  // Reset rate impact before opening confirmation screen
  useEffect(() => {
    if (isConfirmScreen) {
      updateLimitOrdersWarnings({ isRateImpactAccepted: false })
    }
  }, [updateLimitOrdersWarnings, isConfirmScreen])
  const onAcceptPriceImpact = useCallback(() => {
    updateLimitOrdersWarnings({ isPriceImpactAccepted: !isPriceImpactAccepted })
  }, [updateLimitOrdersWarnings, isPriceImpactAccepted])

  const onAcceptRateImpact = useCallback(
    (value: boolean) => {
      updateLimitOrdersWarnings({ isRateImpactAccepted: value })
    },
    [updateLimitOrdersWarnings]
  )

  return isVisible ? (
    <div className={className}>
      {showZeroApprovalWarning && <ZeroApprovalWarning currency={inputCurrency} />}
      {showPriceImpactWarning && (
        <StyledNoImpactWarning
          withoutAccepting={isConfirmScreen}
          isAccepted={isPriceImpactAccepted}
          acceptCallback={onAcceptPriceImpact}
        />
      )}
      {inputCurrency && !isFractionFalsy(inputCurrencyAmount) && !isFractionFalsy(outputCurrencyAmount) && (
        <StyledRateImpactWarning
          withAcknowledge={isConfirmScreen}
          isAccepted={isRateImpactAccepted}
          rateImpact={rateImpact}
          inputCurrency={inputCurrency}
          onAcknowledgeChange={onAcceptRateImpact}
        />
      )}

      {/*// TODO: must be replaced by <NotificationBanner>*/}
      {showHighFeeWarning && <SmallVolumeWarningBanner feeAmount={feeAmount} feePercentage={feePercentage} />}
      {showApprovalBundlingBanner && <BundleTxApprovalBanner />}
      {showSafeWcBundlingBanner && <BundleTxSafeWcBanner />}
    </div>
  ) : null
}
