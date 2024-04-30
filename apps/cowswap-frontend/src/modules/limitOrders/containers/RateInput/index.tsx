import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { formatInputAmount, getAddress, isFractionFalsy } from '@cowprotocol/common-utils'
import { Loader, TokenSymbol } from '@cowprotocol/ui'
import { HelpTooltip } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { RefreshCw } from 'react-feather'


import { useLimitOrdersDerivedState } from 'modules/limitOrders/hooks/useLimitOrdersDerivedState'
import { useRateImpact } from 'modules/limitOrders/hooks/useRateImpact'
import { useUpdateActiveRate } from 'modules/limitOrders/hooks/useUpdateActiveRate'
import { ExecutionPriceTooltip } from 'modules/limitOrders/pure/ExecutionPriceTooltip'
import { HeadingText } from 'modules/limitOrders/pure/RateInput/HeadingText'
import { executionPriceAtom } from 'modules/limitOrders/state/executionPriceAtom'
import { limitRateAtom, updateLimitRateAtom } from 'modules/limitOrders/state/limitRateAtom'
import { toFraction } from 'modules/limitOrders/utils/toFraction'

import { ordersTableFeatures } from 'common/constants/featureFlags'
import { ExecutionPrice } from 'common/pure/ExecutionPrice'
import { getQuoteCurrency, getQuoteCurrencyByStableCoin } from 'common/services/getQuoteCurrency'

import * as styledEl from './styled'

export function RateInput() {
  const { chainId } = useWalletInfo()
  // Rate state
  const {
    isInverted,
    activeRate,
    isLoading,
    marketRate,
    feeAmount,
    isLoadingMarketRate,
    typedValue,
    isTypedValue,
    initialRate,
  } = useAtomValue(limitRateAtom)
  const updateRate = useUpdateActiveRate()
  const updateLimitRateState = useSetAtom(updateLimitRateAtom)
  const executionPrice = useAtomValue(executionPriceAtom)
  const [isQuoteCurrencySet, setIsQuoteCurrencySet] = useState(false)

  // Limit order state
  const { inputCurrency, outputCurrency, inputCurrencyAmount, outputCurrencyAmount } = useLimitOrdersDerivedState()
  const rateImpact = useRateImpact()
  const areBothCurrencies = !!inputCurrency && !!outputCurrency
  const inputCurrencyId = inputCurrency?.symbol
  const outputCurrencyId = outputCurrency?.symbol

  const primaryCurrency = isInverted ? outputCurrency : inputCurrency
  const secondaryCurrency = isInverted ? inputCurrency : outputCurrency

  // Handle rate display
  const displayedRate = useMemo(() => {
    if (isTypedValue) return typedValue || ''

    if (!activeRate || !areBothCurrencies || activeRate.equalTo(0)) return ''

    const rate = isInverted ? activeRate.invert() : activeRate

    return formatInputAmount(rate)
  }, [activeRate, areBothCurrencies, isInverted, isTypedValue, typedValue])

  // Handle set market price
  const handleSetMarketPrice = useCallback(() => {
    updateRate({
      activeRate: isFractionFalsy(marketRate) ? initialRate : marketRate,
      isTypedValue: false,
      isRateFromUrl: false,
      isAlternativeOrderRate: false,
    })
  }, [marketRate, initialRate, updateRate])

  // Handle rate input
  const handleUserInput = useCallback(
    (typedValue: string) => {
      updateLimitRateState({ typedValue })
      updateRate({
        activeRate: toFraction(typedValue, isInverted),
        isTypedValue: true,
        isRateFromUrl: false,
        isAlternativeOrderRate: false,
      })
    },
    [isInverted, updateRate, updateLimitRateState]
  )

  // Handle toggle primary field
  const handleToggle = useCallback(() => {
    updateLimitRateState({ isInverted: !isInverted, isTypedValue: false })
  }, [isInverted, updateLimitRateState])

  const isDisabledMPrice = useMemo(() => {
    if (isLoadingMarketRate) return true

    if (!outputCurrencyId || !inputCurrencyId) return true

    if (marketRate && !marketRate.equalTo(0)) {
      return activeRate?.equalTo(marketRate)
    } else {
      return !!initialRate && activeRate?.equalTo(initialRate)
    }
  }, [activeRate, marketRate, isLoadingMarketRate, initialRate, inputCurrencyId, outputCurrencyId])

  // Apply smart quote selection
  // use getQuoteCurrencyByStableCoin() first for cases when there are no amounts
  useEffect(() => {
    // Don't set quote currency until amounts are not set
    if (
      isQuoteCurrencySet ||
      isFractionFalsy(inputCurrencyAmount) ||
      isFractionFalsy(outputCurrencyAmount) ||
      !inputCurrency ||
      !outputCurrency
    ) {
      return
    }

    const quoteCurrency =
      getQuoteCurrencyByStableCoin(chainId, inputCurrency, outputCurrency) ||
      getQuoteCurrency(chainId, inputCurrencyAmount, outputCurrencyAmount)
    const [quoteCurrencyAddress, inputCurrencyAddress] = [getAddress(quoteCurrency), getAddress(inputCurrency)]

    updateLimitRateState({ isInverted: quoteCurrencyAddress !== inputCurrencyAddress })
    setIsQuoteCurrencySet(true)
  }, [
    isQuoteCurrencySet,
    chainId,
    inputCurrency,
    outputCurrency,
    inputCurrencyAmount,
    outputCurrencyAmount,
    updateLimitRateState,
  ])

  // Reset isQuoteCurrencySet flag on currencies changes
  useEffect(() => {
    setIsQuoteCurrencySet(false)
  }, [inputCurrency, outputCurrency])

  return (
    <>
      <styledEl.Wrapper>
        <styledEl.Header>
          <HeadingText inputCurrency={inputCurrency} currency={primaryCurrency} rateImpact={rateImpact} />

          <styledEl.MarketPriceButton disabled={isDisabledMPrice} onClick={handleSetMarketPrice}>
            <span>Set to market</span>
          </styledEl.MarketPriceButton>
        </styledEl.Header>

        <styledEl.Body>
          {isLoading && areBothCurrencies ? (
            <styledEl.RateLoader />
          ) : (
            <styledEl.NumericalInput
              $loading={false}
              id="rate-limit-amount-input"
              value={displayedRate}
              onUserInput={handleUserInput}
            />
          )}

          <styledEl.ActiveCurrency onClick={handleToggle}>
            <styledEl.ActiveSymbol>
              <TokenSymbol token={secondaryCurrency} />
            </styledEl.ActiveSymbol>
            <styledEl.ActiveIcon>
              <RefreshCw size={12} />
            </styledEl.ActiveIcon>
          </styledEl.ActiveCurrency>
        </styledEl.Body>
      </styledEl.Wrapper>

      {ordersTableFeatures.DISPLAY_EST_EXECUTION_PRICE && (
        <styledEl.EstimatedRate>
          <b>
            Order executes at{' '}
            {isLoadingMarketRate ? (
              <Loader size="14px" style={{ margin: '0 0 -2px 7px' }} />
            ) : executionPrice ? (
              <HelpTooltip
                text={
                  <ExecutionPriceTooltip
                    isInverted={isInverted}
                    feeAmount={feeAmount}
                    marketRate={marketRate}
                    displayedRate={displayedRate}
                    executionPrice={executionPrice}
                  />
                }
              />
            ) : null}
          </b>
          {!isLoadingMarketRate && executionPrice && (
            <ExecutionPrice executionPrice={executionPrice} isInverted={isInverted} />
          )}
        </styledEl.EstimatedRate>
      )}
    </>
  )
}
