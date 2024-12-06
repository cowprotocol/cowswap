import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect, useMemo, useState } from 'react'

import LockedIcon from '@cowprotocol/assets/images/icon-locked.svg'
import UnlockedIcon from '@cowprotocol/assets/images/icon-unlocked.svg'
import UsdIcon from '@cowprotocol/assets/images/icon-USD.svg'
import { formatInputAmount, getAddress, isFractionFalsy } from '@cowprotocol/common-utils'
import { TokenLogo } from '@cowprotocol/tokens'
import { TokenSymbol, HoverTooltip, HelpTooltip } from '@cowprotocol/ui'
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

import { ExecutionPrice } from 'common/pure/ExecutionPrice'
import { getQuoteCurrency, getQuoteCurrencyByStableCoin } from 'common/services/getQuoteCurrency'

import * as styledEl from './styled'

export function RateInput() {
  const { chainId } = useWalletInfo()
  // Rate state
  const { isInverted, activeRate, isLoading, marketRate, isLoadingMarketRate, typedValue, isTypedValue, initialRate } =
    useAtomValue(limitRateAtom)
  const updateRate = useUpdateActiveRate()
  const updateLimitRateState = useSetAtom(updateLimitRateAtom)
  const executionPrice = useAtomValue(executionPriceAtom)
  const [isQuoteCurrencySet, setIsQuoteCurrencySet] = useState(false)
  const [isUsdMode, setIsUsdMode] = useState(false)
  const { limitPriceLocked } = useAtomValue(limitOrdersSettingsAtom)
  const updateLimitOrdersSettings = useSetAtom(updateLimitOrdersSettingsAtom)

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
    [isInverted, updateRate, updateLimitRateState],
  )

  // Handle toggle USD mode
  const handleToggleUsdMode = useCallback(() => {
    setIsUsdMode(!isUsdMode)
  }, [isUsdMode])

  // Handle toggle primary field
  const handleToggle = useCallback(() => {
    if (isUsdMode) {
      // When in USD mode, just switch to token mode without toggling tokens
      setIsUsdMode(false)
    } else {
      // When already in token mode, toggle between tokens
      updateLimitRateState({ isInverted: !isInverted, isTypedValue: false })
    }
  }, [isInverted, updateLimitRateState, isUsdMode])

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
                content="When enabled, the limit price stays fixed when changing the BUY amount. When disabled, the limit price will update based on the BUY amount changes."
                wrapInContainer
                placement="top-start"
              >
                <styledEl.LockIcon onClick={handleTogglePriceLock}>
                  <SVG src={limitPriceLocked ? LockedIcon : UnlockedIcon} width={12} height={10} />
                </styledEl.LockIcon>
              </HoverTooltip>
            }
            onToggle={handleToggle}
          />

          {areBothCurrencies && (
            <styledEl.MarketRateWrapper>
              <i>Market:</i>{' '}
              <styledEl.MarketPriceButton disabled={isDisabledMPrice} onClick={handleSetMarketPrice}>
                {isLoadingMarketRate ? (
                  <styledEl.RateLoader size="14px" />
                ) : marketRate && !marketRate.equalTo(0) ? (
                  formatInputAmount(isInverted ? marketRate.invert() : marketRate)
                ) : (
                  ''
                )}
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
              value={displayedRate}
              onUserInput={handleUserInput}
            />
          )}

          <styledEl.CurrencyToggleGroup>
            <styledEl.ActiveCurrency onClick={handleToggle} $active={!isUsdMode}>
              <styledEl.ActiveSymbol $active={!isUsdMode}>
                <TokenLogo token={secondaryCurrency} size={16} />
                <TokenSymbol token={secondaryCurrency} />
              </styledEl.ActiveSymbol>
            </styledEl.ActiveCurrency>

            <styledEl.UsdButton onClick={handleToggleUsdMode} $active={isUsdMode}>
              <SVG src={UsdIcon} />
            </styledEl.UsdButton>
          </styledEl.CurrencyToggleGroup>
        </styledEl.Body>
      </styledEl.Wrapper>

      <styledEl.EstimatedRate>
        <b>
          {isLoadingMarketRate ? (
            <styledEl.RateLoader size="14px" />
          ) : executionPrice ? (
            <ExecutionPrice executionPrice={executionPrice} isInverted={isInverted} hideFiat />
          ) : (
            '-'
          )}
        </b>
        <span>
          Estimated fill price
          <HelpTooltip text="Network costs (incl. gas) are covered by filling your order when the market price is better than your limit price." />
        </span>
      </styledEl.EstimatedRate>
    </>
  )
}
