import React, { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'

import { NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { formatInputAmount, getIsNativeToken } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { TokenAmount, HoverTooltip } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { BalanceAndSubsidy } from 'legacy/hooks/useCowBalanceAndSubsidy'
import { PriceImpact } from 'legacy/hooks/usePriceImpact'
import { Field } from 'legacy/state/types'

import { useUsdAmount } from 'modules/usdAmount'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'
import { CurrencyInfo } from 'common/pure/CurrencyInputPanel/types'
import { CurrencySelectButton } from 'common/pure/CurrencySelectButton'
import { FiatValue } from 'common/pure/FiatValue'

import * as styledEl from './styled'

import { useConvertUsdToTokenValue } from '../../hooks/useConvertUsdToTokenValue'
import { ReceiveAmount } from '../ReceiveAmount'

interface BuiltItProps {
  className: string
}

export interface CurrencyInputPanelProps extends Partial<BuiltItProps> {
  id: string
  chainId: SupportedChainId | undefined
  areCurrenciesLoading: boolean
  bothCurrenciesSet: boolean
  isChainIdUnsupported: boolean
  disabled?: boolean
  inputDisabled?: boolean
  tokenSelectorDisabled?: boolean
  displayTokenName?: boolean
  displayChainName?: boolean
  inputTooltip?: string
  showSetMax?: boolean
  maxBalance?: CurrencyAmount<Currency> | undefined
  allowsOffchainSigning: boolean
  currencyInfo: CurrencyInfo
  priceImpactParams?: PriceImpact
  subsidyAndBalance?: BalanceAndSubsidy
  onCurrencySelection: (field: Field, currency: Currency) => void
  onUserInput: (field: Field, typedValue: string) => void
  openTokenSelectWidget(
    selectedToken: Nullish<Currency>,
    field: Field | undefined,
    onCurrencySelection: (currency: Currency) => void,
  ): void
  topLabel?: string
  topContent?: ReactNode
  customSelectTokenButton?: ReactNode
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type, complexity
export function CurrencyInputPanel(props: CurrencyInputPanelProps) {
  const {
    id,
    areCurrenciesLoading,
    currencyInfo,
    className,
    priceImpactParams: _priceImpactParams,
    bothCurrenciesSet,
    showSetMax = false,
    maxBalance,
    inputDisabled = false,
    tokenSelectorDisabled = false,
    displayTokenName = false,
    displayChainName = false,
    inputTooltip,
    onUserInput,
    allowsOffchainSigning,
    isChainIdUnsupported,
    openTokenSelectWidget,
    onCurrencySelection,
    subsidyAndBalance = {
      subsidy: {
        tier: 0,
        discount: 0,
      },
    },
    topLabel,
    topContent,
    customSelectTokenButton,
  } = props

  const {
    field,
    currency,
    balance,
    fiatAmount,
    amount,
    isIndependent,
    receiveAmountInfo,
    isUsdValuesMode = false,
  } = currencyInfo
  const disabled = !!props.disabled || isChainIdUnsupported

  const { value: usdAmount } = useUsdAmount(amount)
  const { value: maxBalanceUsdAmount } = useUsdAmount(maxBalance)
  const { value: balanceUsdAmount } = useUsdAmount(balance)
  const viewAmount = isUsdValuesMode ? formatInputAmount(usdAmount) : formatInputAmount(amount, balance, isIndependent)
  const [typedValue, setTypedValue] = useState(viewAmount)

  const convertUsdToTokenValue = useConvertUsdToTokenValue(currency)

  const onUserInputDispatch = useCallback(
    (typedValue: string, currencyValue?: string) => {
      // Always pass through empty string to allow clearing
      if (typedValue === '') {
        setTypedValue('')
        onUserInput(field, '')
        return
      }

      setTypedValue(typedValue)
      // Avoid converting from USD if currencyValue is already provided
      const value = currencyValue || convertUsdToTokenValue(typedValue, isUsdValuesMode)
      onUserInput(field, value)
    },
    [onUserInput, field, convertUsdToTokenValue, isUsdValuesMode],
  )

  const handleMaxInput = useCallback(() => {
    if (!maxBalance) {
      return
    }

    const value = isUsdValuesMode ? maxBalanceUsdAmount : maxBalance

    if (value) {
      onUserInputDispatch(value.toExact(), isUsdValuesMode ? maxBalance.toExact() : undefined)
    }
  }, [maxBalance, onUserInputDispatch, isUsdValuesMode, maxBalanceUsdAmount])

  useEffect(() => {
    // Compare the actual string values to preserve trailing decimals
    if (viewAmount === typedValue) return

    // Don't override empty input
    if (viewAmount === '' && typedValue === '') return

    // Don't override when typing a decimal
    if (typedValue.endsWith('.')) return

    // Don't override when the values are numerically equal (e.g., "5." and "5")
    if (parseFloat(viewAmount || '0') === parseFloat(typedValue || '0')) return

    setTypedValue(viewAmount)
    // We don't need triggering from typedValue changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewAmount])

  const selectedTokenAddress = currency
    ? getIsNativeToken(currency)
      ? NATIVE_CURRENCIES[currency.chainId as SupportedChainId].address
      : currency.address
    : undefined

  const numericalInput = (
    <styledEl.NumericalInput
      className="token-amount-input"
      prependSymbol={isUsdValuesMode ? '$' : ''}
      value={isChainIdUnsupported ? '' : typedValue}
      readOnly={inputDisabled}
      onUserInput={onUserInputDispatch}
      $loading={areCurrenciesLoading}
    />
  )

  const balanceView = (
    <div>
      {balance && !disabled && (
        <styledEl.BalanceText>
          {isUsdValuesMode ? (
            <FiatValue fiatValue={balanceUsdAmount} />
          ) : (
            <TokenAmount amount={balance} defaultValue="0" tokenSymbol={currency} />
          )}
          {showSetMax && balance.greaterThan(0) && (
            <styledEl.SetMaxBtn
              data-click-event={toCowSwapGtmEvent({
                category: CowSwapAnalyticsCategory.TRADE,
                action: 'Set Maximum Sell Tokens',
              })}
              onClick={handleMaxInput}
            >
              Max
            </styledEl.SetMaxBtn>
          )}
        </styledEl.BalanceText>
      )}
    </div>
  )

  const priceImpactParams: typeof _priceImpactParams = useMemo(() => {
    if (!_priceImpactParams) return undefined

    return {
      ..._priceImpactParams,
      // Don't show price impact loading state when only one currency is set
      loading: bothCurrenciesSet ? _priceImpactParams?.loading : false,
    }
  }, [_priceImpactParams, bothCurrenciesSet])

  const onTokenSelectClick = useCallback(() => {
    openTokenSelectWidget(currency, field, (currency) => onCurrencySelection(field, currency))
  }, [openTokenSelectWidget, currency, onCurrencySelection, field])

  return (
    <styledEl.OuterWrapper>
      <styledEl.Wrapper
        id={id}
        className={className}
        data-address={selectedTokenAddress}
        withReceiveAmountInfo={!!receiveAmountInfo}
        pointerDisabled={disabled}
        readOnly={inputDisabled}
      >
        <styledEl.TopRow>
          {topLabel && (
            <styledEl.CurrencyTopLabel>
              {topLabel}{' '}
              {isUsdValuesMode ? <TokenAmount amount={amount} defaultValue="0" tokenSymbol={currency} /> : ''}
            </styledEl.CurrencyTopLabel>
          )}

          {isUsdValuesMode && balanceView}
        </styledEl.TopRow>

        {topContent}
        <styledEl.CurrencyInputBox>
          <div>
            {inputTooltip ? (
              <HoverTooltip wrapInContainer content={inputTooltip}>
                {numericalInput}
              </HoverTooltip>
            ) : (
              numericalInput
            )}
          </div>
          <div>
            <CurrencySelectButton
              onClick={onTokenSelectClick}
              currency={disabled ? undefined : currency || undefined}
              loading={areCurrenciesLoading || disabled}
              readonlyMode={tokenSelectorDisabled}
              displayTokenName={displayTokenName}
              displayChainName={displayChainName}
              customSelectTokenButton={customSelectTokenButton}
            />
          </div>
        </styledEl.CurrencyInputBox>

        <styledEl.CurrencyInputBox>
          <div>
            {amount && !isUsdValuesMode && (
              <styledEl.FiatAmountText>
                <FiatValue priceImpactParams={priceImpactParams} fiatValue={fiatAmount} />
              </styledEl.FiatAmountText>
            )}
          </div>
          {!isUsdValuesMode && balanceView}
        </styledEl.CurrencyInputBox>
      </styledEl.Wrapper>

      {receiveAmountInfo && currency && (
        <ReceiveAmount
          allowsOffchainSigning={allowsOffchainSigning}
          currency={currency}
          receiveAmountInfo={receiveAmountInfo}
          subsidyAndBalance={subsidyAndBalance}
        />
      )}
    </styledEl.OuterWrapper>
  )
}
