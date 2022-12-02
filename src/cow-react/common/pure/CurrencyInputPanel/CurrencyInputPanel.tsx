import React, { useCallback, useEffect, useState } from 'react'
import * as styledEl from './styled'
import { CurrencySelectButton } from '@cow/modules/swap/pure/CurrencySelectButton'
import { Currency } from '@uniswap/sdk-core'
import CurrencySearchModal from 'components/SearchModal/CurrencySearchModal'
import { formatSmartAmount } from 'utils/format'
import { FiatValue } from 'components/CurrencyInputPanel/FiatValue'
import { Trans } from '@lingui/macro'
import { PriceImpact } from 'hooks/usePriceImpact'
import { ReceiveAmount } from '@cow/modules/swap/pure/ReceiveAmount'
import { BalanceAndSubsidy } from 'hooks/useCowBalanceAndSubsidy'
import { setMaxSellTokensAnalytics } from 'components/analytics'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import { Field } from 'state/swap/actions'
import { CurrencyInfo } from '@cow/common/pure/CurrencyInputPanel/types'

interface BuiltItProps {
  className: string
}

export interface CurrencyInputPanelProps extends Partial<BuiltItProps> {
  id: string
  loading: boolean
  disabled?: boolean
  isRateLoading?: boolean
  showSetMax?: boolean
  disableNonToken?: boolean
  allowsOffchainSigning: boolean
  currencyInfo: CurrencyInfo
  priceImpactParams?: PriceImpact
  subsidyAndBalance: BalanceAndSubsidy
  onCurrencySelection: (field: Field, currency: Currency) => void
  onUserInput: (field: Field, typedValue: string) => void
  topLabel?: string
}

export function CurrencyInputPanel(props: CurrencyInputPanelProps) {
  const {
    id,
    loading,
    currencyInfo,
    className,
    priceImpactParams,
    disableNonToken = false,
    showSetMax = false,
    disabled = false,
    onCurrencySelection,
    onUserInput,
    allowsOffchainSigning,
    subsidyAndBalance,
    topLabel,
    isRateLoading,
  } = props
  const { priceImpact, loading: priceImpactLoading } = priceImpactParams || {}
  const { field, currency, balance, fiatAmount, viewAmount, receiveAmountInfo } = currencyInfo
  const [isCurrencySearchModalOpen, setCurrencySearchModalOpen] = useState(false)
  const [typedValue, setTypedValue] = useState(viewAmount)

  useEffect(() => {
    setTypedValue(viewAmount)
  }, [viewAmount])

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
    const maxBalance = maxAmountSpend(balance || undefined)
    maxBalance && onUserInputDispatch(maxBalance.toExact())
    setMaxSellTokensAnalytics()
  }, [balance, onUserInputDispatch])

  useEffect(() => {
    setTypedValue(viewAmount)
  }, [viewAmount])

  return (
    <>
      <styledEl.Wrapper id={id} className={className} withReceiveAmountInfo={!!receiveAmountInfo} disabled={disabled}>
        {topLabel && <styledEl.CurrencyTopLabel>{topLabel}</styledEl.CurrencyTopLabel>}

        <styledEl.CurrencyInputBox>
          <div>
            <CurrencySelectButton
              onClick={() => setCurrencySearchModalOpen(true)}
              currency={disabled ? undefined : currency || undefined}
              loading={loading || disabled}
            />
          </div>
          <div>
            <styledEl.NumericalInput
              className="token-amount-input"
              value={typedValue}
              onUserInput={onUserInputDispatch}
              $loading={loading}
            />
          </div>
        </styledEl.CurrencyInputBox>

        <styledEl.CurrencyInputBox>
          <div>
            {balance && !disabled && (
              <>
                <styledEl.BalanceText title={balance.toExact() + ' ' + currency?.symbol}>
                  <Trans>Balance</Trans>: {formatSmartAmount(balance) || '0'} {currency?.symbol}
                  {showSetMax && balance.greaterThan(0) && (
                    <styledEl.SetMaxBtn onClick={handleMaxInput}>Max</styledEl.SetMaxBtn>
                  )}
                </styledEl.BalanceText>
              </>
            )}
          </div>
          <div>
            <styledEl.FiatAmountText>
              <FiatValue
                isLoading={isRateLoading}
                priceImpactLoading={priceImpactLoading}
                fiatValue={fiatAmount}
                priceImpact={priceImpact}
              />
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
    </>
  )
}
