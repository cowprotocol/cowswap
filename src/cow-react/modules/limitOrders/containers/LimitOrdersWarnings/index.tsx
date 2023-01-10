import React, { useCallback, useEffect } from 'react'

import { RateImpactWarning } from '../../pure/RateImpactWarning'
import { NoImpactWarning } from '@cow/modules/trade/pure/NoImpactWarning'
import { useAtomValue } from 'jotai/utils'
import {
  limitOrdersWarningsAtom,
  updateLimitOrdersWarningsAtom,
} from '@cow/modules/limitOrders/state/limitOrdersWarningsAtom'
import { useRateImpact } from '@cow/modules/limitOrders/hooks/useRateImpact'
import { useWeb3React } from '@web3-react/core'
import { useLimitOrdersTradeState } from '@cow/modules/limitOrders/hooks/useLimitOrdersTradeState'
import { limitOrdersSettingsAtom } from '@cow/modules/limitOrders/state/limitOrdersSettingsAtom'
import { useSetAtom } from 'jotai'
import { PriceImpact } from 'hooks/usePriceImpact'
import styled from 'styled-components/macro'
import { LimitOrdersFormState, useLimitOrdersFormState } from '@cow/modules/limitOrders/hooks/useLimitOrdersFormState'
import { isFractionFalsy } from '@cow/utils/isFractionFalsy'

export interface LimitOrdersWarningsProps {
  priceImpact: PriceImpact
  isConfirmScreen?: boolean
  className?: string
}

const StyledNoImpactWarning = styled(NoImpactWarning)`
  margin: 10px auto;
`
const StyledRateImpactWarning = styled(RateImpactWarning)`
  margin: 10px auto;
`

export function LimitOrdersWarnings(props: LimitOrdersWarningsProps) {
  const { priceImpact, isConfirmScreen = false, className } = props

  const { isPriceImpactAccepted, isRateImpactAccepted } = useAtomValue(limitOrdersWarningsAtom)
  const updateLimitOrdersWarnings = useSetAtom(updateLimitOrdersWarningsAtom)
  const { expertMode } = useAtomValue(limitOrdersSettingsAtom)

  const formState = useLimitOrdersFormState()
  const rateImpact = useRateImpact()
  const { chainId, account } = useWeb3React()
  const { inputCurrency, inputCurrencyAmount, outputCurrencyAmount } = useLimitOrdersTradeState()

  const showPriceImpactWarning =
    !!chainId && !expertMode && !!account && !!priceImpact.error && formState === LimitOrdersFormState.CanTrade

  const isVisible = showPriceImpactWarning || rateImpact < 0

  // Reset price impact flag when there is no price impact
  useEffect(() => {
    updateLimitOrdersWarnings({ isPriceImpactAccepted: !showPriceImpactWarning })
  }, [showPriceImpactWarning, updateLimitOrdersWarnings])

  // Reset rate impact before openning confirmation screen
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
    </div>
  ) : null
}
