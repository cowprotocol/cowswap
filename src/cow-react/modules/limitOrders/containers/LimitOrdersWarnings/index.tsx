import React, { useCallback, useEffect } from 'react'

import { RateImpactWarning } from '../../pure/RateImpactWarning'
import { NoImpactWarning } from '@cow/modules/trade/pure/NoImpactWarning'
import { useAtomValue } from 'jotai/utils'
import {
  limitOrdersWarningsAtom,
  updateLimitOrdersWarningsAtom,
} from '@cow/modules/limitOrders/state/limitOrdersWarningsAtom'
import { useRateImpact } from '@cow/modules/limitOrders/hooks/useRateImpact'
import { useLimitOrdersTradeState } from '@cow/modules/limitOrders/hooks/useLimitOrdersTradeState'
import { limitOrdersSettingsAtom } from '@cow/modules/limitOrders/state/limitOrdersSettingsAtom'
import { useSetAtom } from 'jotai'
import { PriceImpact } from 'hooks/usePriceImpact'
import styled from 'styled-components/macro'
import { LimitOrdersFormState, useLimitOrdersFormState } from '@cow/modules/limitOrders/hooks/useLimitOrdersFormState'
import { isFractionFalsy } from '@cow/utils/isFractionFalsy'
import { useWalletInfo } from '@cow/modules/wallet'
import * as styledEl from '@cow/modules/limitOrders/containers/LimitOrdersWidget/styled'
import AlertTriangle from 'assets/cow-swap/alert.svg'
import SVG from 'react-inlinesvg'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { calculatePercentageInRelationToReference } from '@cow/modules/limitOrders/utils/calculatePercentageInRelationToReference'
import { Nullish } from '@cow/types'
import { HIGH_FEE_WARNING_PERCENTAGE } from '@cow/modules/limitOrders/pure/Orders/OrderRow/EstimatedExecutionPrice'
import { TokenAmount } from '@cow/common/pure/TokenAmount'

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
  const { inputCurrency, inputCurrencyAmount, outputCurrencyAmount } = useLimitOrdersTradeState()

  const showPriceImpactWarning =
    !!chainId && !expertMode && !!account && !!priceImpact.error && formState === LimitOrdersFormState.CanTrade

  const feePercentage = calculatePercentageInRelationToReference({ value: feeAmount, reference: inputCurrencyAmount })

  const showHighFeeWarning = feePercentage?.greaterThan(HIGH_FEE_WARNING_PERCENTAGE)

  const isVisible = showPriceImpactWarning || rateImpact < 0 || showHighFeeWarning

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
      {showHighFeeWarning && (
        <styledEl.SmallVolumeWarningBanner>
          <SVG src={AlertTriangle} description="Alert" />
          <span>
            Small orders are unlikely to be executed. For this order, network fees would be{' '}
            <b>
              {feePercentage?.toFixed(2)}% (
              <TokenAmount amount={feeAmount} tokenSymbol={feeAmount?.currency} />)
            </b>{' '}
            of your sell amount! Therefore, your order is unlikely to execute.
            <br />
            {/* TODO: add link to somewhere */}
            {/*<a href="/">Learn more ↗</a>*/}
          </span>
        </styledEl.SmallVolumeWarningBanner>
      )}
    </div>
  ) : null
}
