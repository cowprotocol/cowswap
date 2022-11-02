import * as styledEl from './styled'
import { useCallback, useEffect, useMemo } from 'react'
import { RefreshCw } from 'react-feather'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { useWeb3React } from '@web3-react/core'

import { HeadingText } from '@cow/modules/limitOrders/pure/RateInput/HeadingText'
import { limitRateAtom, updateLimitRateAtom } from '@cow/modules/limitOrders/state/limitRateAtom'
import { useCalculateRate } from '@cow/modules/limitOrders/hooks/useCalculateRate'
import { useUpdateCurrencyAmount } from '@cow/modules/limitOrders/hooks/useUpdateCurrencyAmount'
import { useLimitOrdersTradeState } from '@cow/modules/limitOrders/hooks/useLimitOrdersTradeState'
import usePrevious from 'hooks/usePrevious'
import { toFirstMeaningfulDecimal } from '../../utils/toFirstMeaningfulDecimal'

export function RateInput() {
  const { chainId } = useWeb3React()
  const prevChainId = usePrevious(chainId)

  // Rate and currency amount hooks
  const calculateRate = useCalculateRate()
  const updateCurrencyAmount = useUpdateCurrencyAmount()

  // Rate state
  const { isInversed, activeRate, isLoading, executionRate, isLoadingExecutionRate, isTypedValue } =
    useAtomValue(limitRateAtom)
  const updateLimitRateState = useUpdateAtom(updateLimitRateAtom)
  const prevIsInversed = usePrevious(isInversed)

  // Limit order state
  const { inputCurrency, outputCurrency, inputCurrencyAmount } = useLimitOrdersTradeState()
  const areBothCurrencies = !!inputCurrency && !!outputCurrency
  const inputCurrencyId = inputCurrency?.symbol
  const outputCurrencyId = outputCurrency?.symbol

  const primaryCurrency = isInversed ? outputCurrencyId : inputCurrencyId
  const secondaryCurrency = isInversed ? inputCurrencyId : outputCurrencyId

  // Handle rate display
  const displayedRate = useMemo(() => {
    if (!activeRate || !areBothCurrencies) return ''
    return isTypedValue ? activeRate : toFirstMeaningfulDecimal(activeRate)
  }, [activeRate, isTypedValue, areBothCurrencies])

  // Handle set market price
  const handleSetMarketPrice = useCallback(() => {
    updateLimitRateState({ activeRate: executionRate, isTypedValue: false })
  }, [executionRate, updateLimitRateState])

  // Handle rate input
  const handleUserInput = useCallback(
    (typedValue: string) => {
      updateLimitRateState({ activeRate: typedValue, isTypedValue: true })
    },
    [updateLimitRateState]
  )

  // Handle toggle primary field
  const handleToggle = () => {
    updateLimitRateState({ isInversed: !isInversed, activeRate: calculateRate(), isTypedValue: false })
  }

  // Observe the active rate change and set the INPUT currency amount
  // which will apply new rate to OUTPUT currency amount
  // Don't call this when the rate changes as a result of click on inverse button
  // because in that case we don't want to recalculate anything
  useEffect(() => {
    if (isInversed === prevIsInversed) {
      updateCurrencyAmount({
        inputCurrencyAmount: inputCurrencyAmount?.toExact(),
        keepOrderKind: true,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRate])

  // Clear active rate on network change
  useEffect(() => {
    if (prevChainId && prevChainId !== chainId) {
      updateLimitRateState({ activeRate: null })
    }
  }, [chainId, prevChainId, updateLimitRateState])

  return (
    <styledEl.Wrapper>
      <styledEl.Header>
        <HeadingText currency={primaryCurrency} />

        <styledEl.MarketPriceButton disabled={isLoadingExecutionRate || !executionRate} onClick={handleSetMarketPrice}>
          <span>Market price</span>
        </styledEl.MarketPriceButton>
      </styledEl.Header>

      <styledEl.Body>
        <styledEl.InputWrapper>
          {isLoading && areBothCurrencies ? (
            <styledEl.RateLoader />
          ) : (
            <styledEl.NumericalInput
              $loading={false}
              className="rate-limit-amount-input"
              value={displayedRate}
              onUserInput={handleUserInput}
            />
          )}
        </styledEl.InputWrapper>

        <styledEl.ActiveCurrency onClick={handleToggle}>
          <styledEl.ActiveSymbol>{secondaryCurrency}</styledEl.ActiveSymbol>
          <styledEl.ActiveIcon>
            <RefreshCw size={12} />
          </styledEl.ActiveIcon>
        </styledEl.ActiveCurrency>
      </styledEl.Body>
    </styledEl.Wrapper>
  )
}
