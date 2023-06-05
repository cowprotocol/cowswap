import { useSetAtom } from 'jotai'
import { useAtomValue } from 'jotai/utils'
import React, { useCallback, useEffect } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import styled from 'styled-components/macro'
import { Nullish } from 'types'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'

import { useLimitOrdersDerivedState } from 'modules/limitOrders/hooks/useLimitOrdersDerivedState'
import { useLimitOrdersFormState } from 'modules/limitOrders/hooks/useLimitOrdersFormState'
import { useRateImpact } from 'modules/limitOrders/hooks/useRateImpact'
import { limitOrdersSettingsAtom } from 'modules/limitOrders/state/limitOrdersSettingsAtom'
import {
  limitOrdersWarningsAtom,
  updateLimitOrdersWarningsAtom,
} from 'modules/limitOrders/state/limitOrdersWarningsAtom'
import { NoImpactWarning } from 'modules/trade/pure/NoImpactWarning'
import { TradeFormValidation, useGetTradeFormValidation } from 'modules/tradeFormValidation'
import { useTradeQuote } from 'modules/tradeQuote'
import { useIsSafeViaWc, useWalletInfo } from 'modules/wallet'

import { useShouldZeroApprove } from 'common/hooks/useShouldZeroApprove'
import {
  BundleTxApprovalBanner,
  BundleTxSafeWcBanner,
  SmallVolumeWarningBanner,
} from 'common/pure/InlineBanner/banners'
import { ZeroApprovalWarning } from 'common/pure/ZeroApprovalWarning'
import { HIGH_FEE_WARNING_PERCENTAGE } from 'constants/common'
import { isFractionFalsy } from 'utils/isFractionFalsy'
import { calculatePercentageInRelationToReference } from 'utils/orderUtils/calculatePercentageInRelationToReference'

import { RateImpactWarning } from '../../pure/RateImpactWarning'

const FORM_STATES_TO_SHOW_BUNDLE_BANNER = [TradeFormValidation.ExpertApproveAndSwap, TradeFormValidation.ApproveAndSwap]

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

  const localFormValidation = useLimitOrdersFormState()
  const primaryFormValidation = useGetTradeFormValidation()
  const rateImpact = useRateImpact()
  const { chainId, account } = useWalletInfo()
  const { slippageAdjustedSellAmount, inputCurrency, inputCurrencyAmount, outputCurrency, outputCurrencyAmount } =
    useLimitOrdersDerivedState()
  const tradeQuote = useTradeQuote()

  const canTrade = localFormValidation === null && primaryFormValidation === null && !tradeQuote.error
  const showPriceImpactWarning =
    canTrade && !tradeQuote.isLoading && !!chainId && !expertMode && !!account && !!priceImpact.error
  const showRateImpactWarning =
    canTrade &&
    !tradeQuote.isLoading &&
    inputCurrency &&
    !isFractionFalsy(inputCurrencyAmount) &&
    !isFractionFalsy(outputCurrencyAmount)

  const feePercentage = calculatePercentageInRelationToReference({ value: feeAmount, reference: inputCurrencyAmount })

  const showHighFeeWarning = feePercentage?.greaterThan(HIGH_FEE_WARNING_PERCENTAGE)

  const showApprovalBundlingBanner =
    !isConfirmScreen && primaryFormValidation && FORM_STATES_TO_SHOW_BUNDLE_BANNER.includes(primaryFormValidation)
  const shouldZeroApprove = useShouldZeroApprove(slippageAdjustedSellAmount)
  const showZeroApprovalWarning = shouldZeroApprove && outputCurrency !== null // Show warning only when output currency is also present.

  const isSafeViaWc = useIsSafeViaWc()
  const showSafeWcBundlingBanner =
    !isConfirmScreen &&
    !showApprovalBundlingBanner &&
    isSafeViaWc &&
    primaryFormValidation === TradeFormValidation.ApproveRequired

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
      {showRateImpactWarning && (
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
