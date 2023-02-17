import * as styledEl from './styled'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { RefreshCw } from 'react-feather'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'

import { HeadingText } from '@cow/modules/limitOrders/pure/RateInput/HeadingText'
import { limitRateAtom, updateLimitRateAtom } from '@cow/modules/limitOrders/state/limitRateAtom'
import { useLimitOrdersTradeState } from '@cow/modules/limitOrders/hooks/useLimitOrdersTradeState'
import { toFraction } from '@cow/modules/limitOrders/utils/toFraction'
import { useRateImpact } from '@cow/modules/limitOrders/hooks/useRateImpact'
import { isFractionFalsy } from '@cow/utils/isFractionFalsy'
import { getQuoteCurrency, getQuoteCurrencyByStableCoin } from '@cow/common/services/getQuoteCurrency'
import { useWeb3React } from '@web3-react/core'
import { getAddress } from '@cow/utils/getAddress'
import { useUpdateActiveRate } from '@cow/modules/limitOrders/hooks/useUpdateActiveRate'
import { TokenSymbol } from '@cow/common/pure/TokenSymbol'
import { formatInputAmount } from '@cow/utils/amountFormat'
import QuestionHelper from 'components/QuestionHelper'
import { ExecutionPriceTooltip } from '@cow/modules/limitOrders/pure/ExecutionPriceTooltip'
import { TokenAmount } from '@cow/common/pure/TokenAmount'
import { FiatAmount } from '@cow/common/pure/FiatAmount'
import Loader from 'components/Loader'
import { ExecutionPriceInfo } from '@cow/modules/limitOrders/hooks/useExecutionPriceInfo'

export interface RateInputProps {
  executionPriceInfo: ExecutionPriceInfo
}

export function RateInput({ executionPriceInfo }: RateInputProps) {
  const { chainId } = useWeb3React()
  // Rate state
  const {
    isInversed,
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
  const updateLimitRateState = useUpdateAtom(updateLimitRateAtom)
  const [isQuoteCurrencySet, setIsQuoteCurrencySet] = useState(false)

  // Limit order state
  const { inputCurrency, outputCurrency, inputCurrencyAmount, outputCurrencyAmount } = useLimitOrdersTradeState()
  const rateImpact = useRateImpact()
  const areBothCurrencies = !!inputCurrency && !!outputCurrency
  const inputCurrencyId = inputCurrency?.symbol
  const outputCurrencyId = outputCurrency?.symbol

  const primaryCurrency = isInversed ? outputCurrency : inputCurrency
  const secondaryCurrency = isInversed ? inputCurrency : outputCurrency

  const { price: executionPrice, fiatPrice: executionPriceFiat } = executionPriceInfo

  // Handle rate display
  const displayedRate = useMemo(() => {
    if (isTypedValue) return typedValue || ''

    if (!activeRate || !areBothCurrencies || activeRate.equalTo(0)) return ''

    const rate = isInversed ? activeRate.invert() : activeRate

    return formatInputAmount(rate)
  }, [activeRate, areBothCurrencies, isInversed, isTypedValue, typedValue])

  // Handle set market price
  const handleSetMarketPrice = useCallback(() => {
    updateRate({
      activeRate: isFractionFalsy(marketRate) ? initialRate : marketRate,
      isTypedValue: false,
      isRateFromUrl: false,
    })
  }, [marketRate, initialRate, updateRate])

  // Handle rate input
  const handleUserInput = useCallback(
    (typedValue: string) => {
      updateLimitRateState({ typedValue })
      updateRate({
        activeRate: toFraction(typedValue, isInversed),
        isTypedValue: true,
        isRateFromUrl: false,
      })
    },
    [isInversed, updateRate, updateLimitRateState]
  )

  // Handle toggle primary field
  const handleToggle = useCallback(() => {
    updateLimitRateState({ isInversed: !isInversed, isTypedValue: false })
  }, [isInversed, updateLimitRateState])

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

    updateLimitRateState({ isInversed: quoteCurrencyAddress !== inputCurrencyAddress })
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
          <styledEl.ActiveCurrency onClick={handleToggle}>
            <styledEl.ActiveSymbol>
              <TokenSymbol token={secondaryCurrency} />
            </styledEl.ActiveSymbol>
            <styledEl.ActiveIcon>
              <RefreshCw size={12} />
            </styledEl.ActiveIcon>
          </styledEl.ActiveCurrency>

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
        </styledEl.Body>
      </styledEl.Wrapper>

      <styledEl.EstimatedRate>
        <b>
          Est. execution price{' '}
          {isLoadingMarketRate ? (
            <Loader size="14px" style={{ margin: '0 0 -2px 7px' }} />
          ) : executionPrice ? (
            <QuestionHelper
              text={
                <ExecutionPriceTooltip
                  feeAmount={feeAmount}
                  displayedRate={displayedRate}
                  executionPrice={executionPrice}
                  executionPriceFiat={executionPriceFiat}
                />
              }
            />
          ) : null}
        </b>
        {!isLoadingMarketRate && executionPrice && (
          <span>
            ≈ <TokenAmount amount={executionPrice} tokenSymbol={secondaryCurrency} />
            {executionPriceFiat && (
              <i>
                {' '}
                (<FiatAmount amount={executionPriceFiat} />)
              </i>
            )}
          </span>
        )}
      </styledEl.EstimatedRate>
    </>
  )
}
