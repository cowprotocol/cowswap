import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { setMaxSellTokensAnalytics } from '@cowprotocol/analytics'
import { NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { formatInputAmount, getIsNativeToken } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { TokenAmount, HoverTooltip } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Trans } from '@lingui/macro'

import { BalanceAndSubsidy } from 'legacy/hooks/useCowBalanceAndSubsidy'
import { PriceImpact } from 'legacy/hooks/usePriceImpact'
import { Field } from 'legacy/state/types'

import { ReceiveAmount } from 'modules/swap/pure/ReceiveAmount'

import { CurrencyInfo } from 'common/pure/CurrencyInputPanel/types'
import { CurrencySelectButton } from 'common/pure/CurrencySelectButton'
import { FiatValue } from 'common/pure/FiatValue'

import * as styledEl from './styled'

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
  inputTooltip?: string
  showSetMax?: boolean
  maxBalance?: CurrencyAmount<Currency> | undefined
  allowsOffchainSigning: boolean
  currencyInfo: CurrencyInfo
  priceImpactParams?: PriceImpact
  subsidyAndBalance?: BalanceAndSubsidy
  onCurrencySelection: (field: Field, currency: Currency) => void
  onUserInput: (field: Field, typedValue: string) => void
  openTokenSelectWidget(selectedToken: string | undefined, onCurrencySelection: (currency: Currency) => void): void
  topLabel?: string
}

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
  } = props

  const { field, currency, balance, fiatAmount, amount, isIndependent, receiveAmountInfo } = currencyInfo
  const disabled = !!props.disabled || isChainIdUnsupported
  const viewAmount = formatInputAmount(amount, balance, isIndependent)
  const [typedValue, setTypedValue] = useState(viewAmount)

  const onUserInputDispatch = useCallback(
    (typedValue: string) => {
      setTypedValue(typedValue)
      onUserInput(field, typedValue)
    },
    [onUserInput, field]
  )
  const handleMaxInput = useCallback(() => {
    if (!maxBalance) {
      return
    }

    onUserInputDispatch(maxBalance.toExact())
    setMaxSellTokensAnalytics()
  }, [maxBalance, onUserInputDispatch])

  useEffect(() => {
    const areValuesSame = parseFloat(viewAmount) === parseFloat(typedValue)

    // Don't override typedValue when, for example: viewAmount = 5  and typedValue = 5.
    if (areValuesSame) return

    // Don't override typedValue, when viewAmount from props and typedValue are zero (0 or 0. or 0.000)
    if (!viewAmount && (!typedValue || parseFloat(typedValue) === 0)) return

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
      value={isChainIdUnsupported ? '' : typedValue}
      readOnly={inputDisabled}
      onUserInput={onUserInputDispatch}
      $loading={areCurrenciesLoading}
    />
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
    openTokenSelectWidget(selectedTokenAddress, (currency) => onCurrencySelection(field, currency))
  }, [openTokenSelectWidget, selectedTokenAddress, onCurrencySelection, field])

  return (
    <styledEl.OuterWrapper>
      <styledEl.Wrapper
        id={id}
        className={className}
        withReceiveAmountInfo={!!receiveAmountInfo}
        pointerDisabled={disabled}
        readOnly={inputDisabled}
      >
        {topLabel && <styledEl.CurrencyTopLabel>{topLabel}</styledEl.CurrencyTopLabel>}

        <styledEl.CurrencyInputBox>
          <div>
            <CurrencySelectButton
              onClick={onTokenSelectClick}
              currency={disabled ? undefined : currency || undefined}
              loading={areCurrenciesLoading || disabled}
              readonlyMode={tokenSelectorDisabled}
            />
          </div>
          <div>
            {inputTooltip ? <HoverTooltip wrapInContainer content={inputTooltip}>{numericalInput}</HoverTooltip> : numericalInput}
          </div>
        </styledEl.CurrencyInputBox>

        <styledEl.CurrencyInputBox>
          <div>
            {balance && !disabled && (
              <styledEl.BalanceText>
                <Trans>Balance</Trans>: <TokenAmount amount={balance} defaultValue="0" tokenSymbol={currency} />
                {showSetMax && balance.greaterThan(0) && (
                  <styledEl.SetMaxBtn onClick={handleMaxInput}>Max</styledEl.SetMaxBtn>
                )}
              </styledEl.BalanceText>
            )}
          </div>
          <div>
            {amount && (
              <styledEl.FiatAmountText>
                <FiatValue priceImpactParams={priceImpactParams} fiatValue={fiatAmount} />
              </styledEl.FiatAmountText>
            )}
          </div>
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
