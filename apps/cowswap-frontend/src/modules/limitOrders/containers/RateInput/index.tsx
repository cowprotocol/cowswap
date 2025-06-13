import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect, useMemo, useState } from 'react'

import LockedIcon from '@cowprotocol/assets/images/icon-locked.svg'
import UnlockedIcon from '@cowprotocol/assets/images/icon-unlocked.svg'
import UsdIcon from '@cowprotocol/assets/images/icon-USD.svg'
import { formatInputAmount, getAddress, isFractionFalsy, tryParseCurrencyAmount } from '@cowprotocol/common-utils'
import { TokenLogo } from '@cowprotocol/tokens'
import { FiatAmount, HelpTooltip, HoverTooltip, TokenSymbol } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import SVG from 'react-inlinesvg'

import { useLimitOrdersDerivedState } from 'modules/limitOrders/hooks/useLimitOrdersDerivedState'
import { useRateImpact } from 'modules/limitOrders/hooks/useRateImpact'
import { useUpdateActiveRate } from 'modules/limitOrders/hooks/useUpdateActiveRate'
import { HeadingText } from 'modules/limitOrders/pure/RateInput/HeadingText'
import { executionPriceAtom } from 'modules/limitOrders/state/executionPriceAtom'
import {
  limitOrdersSettingsAtom,
  updateLimitOrdersSettingsAtom,
} from 'modules/limitOrders/state/limitOrdersSettingsAtom'
import { limitRateAtom, updateLimitRateAtom } from 'modules/limitOrders/state/limitRateAtom'
import { toFraction } from 'modules/limitOrders/utils/toFraction'
import { useUsdAmount } from 'modules/usdAmount'

import { useConvertUsdToTokenValue } from 'common/hooks/useConvertUsdToTokenValue'
import { ExecutionPrice } from 'common/pure/ExecutionPrice'
import { getQuoteCurrency, getQuoteCurrencyByStableCoin } from 'common/services/getQuoteCurrency'

import { isLocalUsdRateModeAtom } from './atoms'
import { useExecutionPriceUsdValue } from './hooks/useExecutionPriceUsdValue'
import { useRateDisplayedValue } from './hooks/useRateDisplayedValue'
import * as styledEl from './styled'

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type, complexity
export function RateInput() {
  const { chainId } = useWalletInfo()
  // Rate state
  const { isInverted, activeRate, isLoading, marketRate, isLoadingMarketRate, initialRate } =
    useAtomValue(limitRateAtom)
  const updateRate = useUpdateActiveRate()
  const updateLimitRateState = useSetAtom(updateLimitRateAtom)
  const executionPrice = useAtomValue(executionPriceAtom)
  const { limitPriceLocked, partialFillsEnabled } = useAtomValue(limitOrdersSettingsAtom)
  const updateLimitOrdersSettings = useSetAtom(updateLimitOrdersSettingsAtom)

  const executionPriceUsdValue = useExecutionPriceUsdValue(executionPrice)

  const [isQuoteCurrencySet, setIsQuoteCurrencySet] = useState(false)
  const [typedTrailingZeros, setTypedTrailingZeros] = useState('')
  const [isUsdRateMode, setIsUsdRateMode] = useAtom(isLocalUsdRateModeAtom)

  // Limit order state
  const { inputCurrency, outputCurrency, inputCurrencyAmount, outputCurrencyAmount } = useLimitOrdersDerivedState()
  const rateImpact = useRateImpact()
  const areBothCurrencies = !!inputCurrency && !!outputCurrency
  const inputCurrencyId = inputCurrency?.symbol
  const outputCurrencyId = outputCurrency?.symbol

  const primaryCurrency = isInverted ? outputCurrency : inputCurrency
  const secondaryCurrency = isInverted ? inputCurrency : outputCurrency

  const marketRateRaw =
    marketRate && !marketRate.equalTo(0) ? formatInputAmount(isInverted ? marketRate.invert() : marketRate) : null

  const { value: marketRateUsd } = useUsdAmount(
    marketRateRaw && secondaryCurrency ? tryParseCurrencyAmount(marketRateRaw, secondaryCurrency) : null,
  )

  const marketRateDisplay = isUsdRateMode ? '$' + formatInputAmount(marketRateUsd) : marketRateRaw

  const displayedRate = useRateDisplayedValue(secondaryCurrency, isUsdRateMode)
  const convertUsdToTokenValue = useConvertUsdToTokenValue(secondaryCurrency)

  // Handle rate input
  const handleUserInput = useCallback(
    (typedValue: string) => {
      // Always pass through empty string to allow clearing
      if (typedValue === '') {
        setTypedTrailingZeros('')
        updateLimitRateState({ typedValue: '' })
        updateRate({
          activeRate: null,
          isTypedValue: true,
          isRateFromUrl: false,
          isAlternativeOrderRate: false,
        })
        return
      }

      // Keep the trailing decimal point or zeros
      const trailing = typedValue.slice(displayedRate.length)
      const hasTrailingDecimal = typedValue.endsWith('.')
      const onlyTrailingZeroAdded = typedValue.includes('.') && /^0+$/.test(trailing)

      /**
       * Since we convert USD to token value, we need to handle trailing zeros and decimal points separately.
       * If we don't, they will be lost during the conversion between USD and token values.
       */
      if (hasTrailingDecimal || onlyTrailingZeroAdded) {
        setTypedTrailingZeros(trailing)

        // For trailing decimal, we also need to update the base value
        if (hasTrailingDecimal && !onlyTrailingZeroAdded) {
          const baseValue = typedValue.slice(0, -1) // Remove the trailing decimal for conversion
          const value = convertUsdToTokenValue(baseValue, isUsdRateMode)
          updateLimitRateState({ typedValue: value })
          updateRate({
            activeRate: toFraction(value, isInverted),
            isTypedValue: true,
            isRateFromUrl: false,
            isAlternativeOrderRate: false,
          })
        }
        return
      }

      setTypedTrailingZeros('')

      // Convert to token value if in USD mode
      const value = convertUsdToTokenValue(typedValue, isUsdRateMode)

      // Update the rate state with the new value
      updateLimitRateState({ typedValue: value })
      updateRate({
        activeRate: toFraction(value, isInverted),
        isTypedValue: true,
        isRateFromUrl: false,
        isAlternativeOrderRate: false,
      })
    },
    [isUsdRateMode, isInverted, updateRate, updateLimitRateState, displayedRate, convertUsdToTokenValue],
  )

  // Handle set market price
  const handleSetMarketPrice = useCallback(() => {
    updateRate({
      activeRate: isFractionFalsy(marketRate) ? initialRate : marketRate,
      isTypedValue: false,
      isRateFromUrl: false,
      isAlternativeOrderRate: false,
    })
  }, [marketRate, initialRate, updateRate])

  // Handle toggle primary field
  const toggleInvertPrice = useCallback(() => {
    updateLimitRateState({ isInverted: !isInverted, isTypedValue: false })
  }, [isInverted, updateLimitRateState])

  const toggleSwitchUsdDisplay = useCallback(() => {
    if (isUsdRateMode) {
      // When in USD mode, just switch to token mode without toggling tokens
      setIsUsdRateMode(false)
    } else {
      // When already in token mode, toggle between tokens
      updateLimitRateState({ isInverted: !isInverted, isTypedValue: false })
    }
  }, [isInverted, updateLimitRateState, isUsdRateMode, setIsUsdRateMode])

  // Handle toggle price lock
  const handleTogglePriceLock = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation()
      updateLimitOrdersSettings({ limitPriceLocked: !limitPriceLocked })
    },
    [limitPriceLocked, updateLimitOrdersSettings],
  )

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
          <HeadingText
            inputCurrency={inputCurrency}
            currency={primaryCurrency}
            rateImpact={rateImpact}
            toggleIcon={
              <HoverTooltip
                content="When locked, the limit price stays fixed when changing the amounts. When unlocked, the limit price will update based on the amount changes."
                wrapInContainer
                placement="top-start"
              >
                <styledEl.LockIcon onClick={handleTogglePriceLock}>
                  <SVG src={limitPriceLocked ? LockedIcon : UnlockedIcon} width={12} height={10} />
                </styledEl.LockIcon>
              </HoverTooltip>
            }
            onToggle={toggleInvertPrice}
          />
          {areBothCurrencies && (isLoadingMarketRate || marketRateDisplay) && (
            <styledEl.MarketRateWrapper>
              <i>Market:</i>{' '}
              <styledEl.MarketPriceButton disabled={isDisabledMPrice} onClick={handleSetMarketPrice}>
                {isLoadingMarketRate ? <styledEl.RateLoader size="14px" /> : marketRateDisplay}
              </styledEl.MarketPriceButton>
            </styledEl.MarketRateWrapper>
          )}
        </styledEl.Header>
        <styledEl.Body>
          {isLoading && areBothCurrencies ? (
            <styledEl.RateLoader />
          ) : (
            <styledEl.NumericalInput
              $loading={false}
              id="rate-limit-amount-input"
              prependSymbol={isUsdRateMode ? '$' : ''}
              value={displayedRate + typedTrailingZeros}
              onUserInput={handleUserInput}
            />
          )}

          {secondaryCurrency && (
            <styledEl.CurrencyToggleGroup>
              <styledEl.ActiveCurrency onClick={toggleSwitchUsdDisplay} $active={!isUsdRateMode}>
                <styledEl.ActiveSymbol $active={!isUsdRateMode}>
                  <TokenLogo token={secondaryCurrency} size={16} />
                  <TokenSymbol token={secondaryCurrency} />
                </styledEl.ActiveSymbol>
              </styledEl.ActiveCurrency>

              <styledEl.UsdButton onClick={() => setIsUsdRateMode((state) => !state)} $active={isUsdRateMode}>
                <SVG src={UsdIcon} />
              </styledEl.UsdButton>
            </styledEl.CurrencyToggleGroup>
          )}
        </styledEl.Body>
      </styledEl.Wrapper>

      <styledEl.EstimatedRate>
        <b>
          {isLoadingMarketRate ? (
            <styledEl.RateLoader size="14px" />
          ) : executionPrice ? (
            isUsdRateMode ? (
              <FiatAmount amount={executionPriceUsdValue} />
            ) : (
              <ExecutionPrice executionPrice={executionPrice} isInverted={isInverted} hideFiat />
            )
          ) : (
            '-'
          )}
        </b>
        <span>
          {partialFillsEnabled ? 'Est. partial fill price' : 'Estimated fill price'}
          <HelpTooltip text="Network costs (incl. gas) are covered by filling your order when the market price is better than your limit price." />
        </span>
      </styledEl.EstimatedRate>
    </>
  )
}
