import React, { useCallback, useEffect, useState } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Trans } from '@lingui/macro'

import { setMaxSellTokensAnalytics } from 'legacy/components/analytics'
import CurrencySearchModal from 'legacy/components/SearchModal/CurrencySearchModal'
import { MouseoverTooltip } from 'legacy/components/Tooltip'
import { BalanceAndSubsidy } from 'legacy/hooks/useCowBalanceAndSubsidy'
import { PriceImpact } from 'legacy/hooks/usePriceImpact'
import { Field } from 'legacy/state/swap/actions'

import { ReceiveAmount } from 'modules/swap/pure/ReceiveAmount'

import { CurrencyInfo } from 'common/pure/CurrencyInputPanel/types'
import { CurrencySelectButton } from 'common/pure/CurrencySelectButton'
import { FiatValue } from 'common/pure/FiatValue'
import { TokenAmount } from 'common/pure/TokenAmount'
import { formatInputAmount } from 'utils/amountFormat'

import * as styledEl from './styled'

interface BuiltItProps {
  className: string
}

export interface CurrencyInputPanelProps extends Partial<BuiltItProps> {
  id: string
  chainId: SupportedChainId | undefined
  areCurrenciesLoading: boolean
  isChainIdUnsupported: boolean
  disabled?: boolean
  inputDisabled?: boolean
  inputTooltip?: string
  showSetMax?: boolean
  maxBalance?: CurrencyAmount<Currency> | undefined
  disableNonToken?: boolean
  allowsOffchainSigning: boolean
  currencyInfo: CurrencyInfo
  priceImpactParams?: PriceImpact
  subsidyAndBalance?: BalanceAndSubsidy
  onCurrencySelection: (field: Field, currency: Currency) => void
  onUserInput: (field: Field, typedValue: string) => void
  topLabel?: string
}

export function CurrencyInputPanel(props: CurrencyInputPanelProps) {
  const {
    id,
    areCurrenciesLoading,
    currencyInfo,
    className,
    priceImpactParams,
    disableNonToken = false,
    showSetMax = false,
    maxBalance,
    inputDisabled = false,
    inputTooltip,
    onCurrencySelection,
    onUserInput,
    allowsOffchainSigning,
    isChainIdUnsupported,
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
  const [isCurrencySearchModalOpen, setCurrencySearchModalOpen] = useState(false)
  const [typedValue, setTypedValue] = useState(viewAmount)

  const onCurrencySelect = useCallback(
    (currency: Currency) => {
      onCurrencySelection(field, currency)
    },
    [onCurrencySelection, field]
  )
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

  const numericalInput = (
    <styledEl.NumericalInput
      className="token-amount-input"
      value={isChainIdUnsupported ? '' : typedValue}
      readOnly={inputDisabled}
      onUserInput={onUserInputDispatch}
      $loading={areCurrenciesLoading}
    />
  )

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
              onClick={() => setCurrencySearchModalOpen(true)}
              currency={disabled ? undefined : currency || undefined}
              loading={areCurrenciesLoading || disabled}
            />
          </div>
          <div>
            {inputTooltip ? <MouseoverTooltip text={inputTooltip}>{numericalInput}</MouseoverTooltip> : numericalInput}
          </div>
        </styledEl.CurrencyInputBox>

        <styledEl.CurrencyInputBox>
          <div>
            {balance && !disabled && (
              <styledEl.BalanceText>
                <Trans>Balance</Trans>:{' '}
                <TokenAmount amount={balance} defaultValue="0" tokenSymbol={currency} opacitySymbol />
                {showSetMax && balance.greaterThan(0) && (
                  <styledEl.SetMaxBtn onClick={handleMaxInput}>Max</styledEl.SetMaxBtn>
                )}
              </styledEl.BalanceText>
            )}
          </div>
          <div>
            <styledEl.FiatAmountText>
              <FiatValue priceImpactParams={priceImpactParams} fiatValue={fiatAmount} />
            </styledEl.FiatAmountText>
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

      <CurrencySearchModal
        isOpen={isCurrencySearchModalOpen}
        onDismiss={() => setCurrencySearchModalOpen(false)}
        onCurrencySelect={onCurrencySelect}
        selectedCurrency={currency}
        otherSelectedCurrency={currency}
        showCommonBases={true}
        showCurrencyAmount={true}
        disableNonToken={disableNonToken}
      />
    </styledEl.OuterWrapper>
  )
}
