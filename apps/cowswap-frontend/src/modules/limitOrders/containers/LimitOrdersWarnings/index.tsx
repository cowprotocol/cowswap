import { useAtomValue, useSetAtom } from 'jotai'
import React, { useCallback, useEffect } from 'react'

import { isFractionFalsy } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import styled from 'styled-components/macro'
import { Nullish } from 'types'

import { useLimitOrdersDerivedState } from 'modules/limitOrders/hooks/useLimitOrdersDerivedState'
import { useLimitOrdersFormState } from 'modules/limitOrders/hooks/useLimitOrdersFormState'
import { useRateImpact } from 'modules/limitOrders/hooks/useRateImpact'
import {
  limitOrdersWarningsAtom,
  updateLimitOrdersWarningsAtom,
} from 'modules/limitOrders/state/limitOrdersWarningsAtom'
import { useGetTradeFormValidation } from 'modules/tradeFormValidation'
import { TradeFormValidation } from 'modules/tradeFormValidation/types'
import { useTradeQuote } from 'modules/tradeQuote'
import { SellNativeWarningBanner } from 'modules/tradeWidgetAddons'

import { HIGH_FEE_WARNING_PERCENTAGE } from 'common/constants/common'
import { calculatePercentageInRelationToReference } from 'utils/orderUtils/calculatePercentageInRelationToReference'

import { RateImpactWarning } from '../../pure/RateImpactWarning'
import { SmallVolumeWarningBanner } from '../../pure/SmallVolumeWarningBanner'

const FORM_STATES_TO_SHOW_BUNDLE_BANNER = [TradeFormValidation.ApproveAndSwap]

export interface LimitOrdersWarningsProps {
  feeAmount?: Nullish<CurrencyAmount<Currency>>
  isConfirmScreen?: boolean
  className?: string
}

const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  gap: 10px;
`

const StyledRateImpactWarning = styled(RateImpactWarning)`
  margin: 10px auto 0;
`

// TODO: Add proper return type annotation
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, complexity
export function LimitOrdersWarnings(props: LimitOrdersWarningsProps) {
  const { feeAmount, isConfirmScreen = false, className } = props

  const { isRateImpactAccepted } = useAtomValue(limitOrdersWarningsAtom)
  const updateLimitOrdersWarnings = useSetAtom(updateLimitOrdersWarningsAtom)

  const localFormValidation = useLimitOrdersFormState()
  const primaryFormValidation = useGetTradeFormValidation()
  const rateImpact = useRateImpact()
  const { inputCurrency, inputCurrencyAmount, outputCurrencyAmount } = useLimitOrdersDerivedState()
  const tradeQuote = useTradeQuote()

  const isBundling = primaryFormValidation && FORM_STATES_TO_SHOW_BUNDLE_BANNER.includes(primaryFormValidation)

  const canTrade = localFormValidation === null && (primaryFormValidation === null || isBundling) && !tradeQuote.error

  const showRateImpactWarning =
    canTrade && inputCurrency && !isFractionFalsy(inputCurrencyAmount) && !isFractionFalsy(outputCurrencyAmount)

  const feePercentage = calculatePercentageInRelationToReference({ value: feeAmount, reference: inputCurrencyAmount })

  const showHighFeeWarning = feePercentage?.greaterThan(HIGH_FEE_WARNING_PERCENTAGE)

  // TODO: implement Safe App EthFlow bundling for LIMIT and disable the warning in that case
  const showNativeSellWarning = primaryFormValidation === TradeFormValidation.SellNativeToken

  const isVisible = rateImpact < 0 || showHighFeeWarning || showNativeSellWarning

  // Reset rate impact before opening confirmation screen
  useEffect(() => {
    if (isConfirmScreen) {
      updateLimitOrdersWarnings({ isRateImpactAccepted: false })
    }
  }, [updateLimitOrdersWarnings, isConfirmScreen])

  const onAcceptRateImpact = useCallback(
    (value: boolean) => {
      updateLimitOrdersWarnings({ isRateImpactAccepted: value })
    },
    [updateLimitOrdersWarnings],
  )

  return isVisible ? (
    <Wrapper className={className}>
      {showRateImpactWarning && (
        <StyledRateImpactWarning
          withAcknowledge={isConfirmScreen}
          isAccepted={isRateImpactAccepted}
          rateImpact={rateImpact}
          inputCurrency={inputCurrency}
          onAcknowledgeChange={onAcceptRateImpact}
        />
      )}

      {showHighFeeWarning && <SmallVolumeWarningBanner feeAmount={feeAmount} feePercentage={feePercentage} />}
      {showNativeSellWarning && <SellNativeWarningBanner />}
    </Wrapper>
  ) : null
}
