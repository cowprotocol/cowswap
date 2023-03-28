import React, { useCallback, useEffect, useState } from 'react'
import * as styledEl from './styled'
import { CurrencySelectButton } from '@cow/modules/swap/pure/CurrencySelectButton'
import { Currency } from '@uniswap/sdk-core'
import CurrencySearchModal from 'components/SearchModal/CurrencySearchModal'
import { FiatValue } from 'custom/components/CurrencyInputPanel/FiatValue/FiatValueMod'
import { Trans } from '@lingui/macro'
import { PriceImpact } from 'hooks/usePriceImpact'
import { ReceiveAmount } from '@cow/modules/swap/pure/ReceiveAmount'
import { BalanceAndSubsidy } from 'hooks/useCowBalanceAndSubsidy'
import { setMaxSellTokensAnalytics } from 'components/analytics'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import { Field } from 'state/swap/actions'
import { CurrencyInfo } from '@cow/common/pure/CurrencyInputPanel/types'
import { isSupportedChainId } from 'lib/hooks/routing/clientSideSmartOrderRouter'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { MouseoverTooltip } from 'components/Tooltip'
import { TokenAmount } from '@cow/common/pure/TokenAmount'

interface BuiltItProps {
  className: string
}

export interface CurrencyInputPanelProps extends Partial<BuiltItProps> {
  id: string
  chainId: SupportedChainId | undefined
  loading: boolean
  disabled?: boolean
  inputDisabled?: boolean
  inputTooltip?: string
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
    inputDisabled = false,
    inputTooltip,
    onCurrencySelection,
    onUserInput,
    allowsOffchainSigning,
    subsidyAndBalance,
    topLabel,
    isRateLoading,
  } = props

  const isSupportedNetwork = isSupportedChainId(props.chainId as number | undefined)
  const { priceImpact, loading: priceImpactLoading } = priceImpactParams || {}
  const { field, currency, balance, fiatAmount, viewAmount, receiveAmountInfo } = currencyInfo
  const disabled = props.disabled || !isSupportedNetwork

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
    const maxBalance = maxAmountSpend(balance || undefined)
    if (!maxBalance) {
      return
    }

    onUserInputDispatch(maxBalance.toExact())
    setMaxSellTokensAnalytics()
  }, [balance, onUserInputDispatch])

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
      value={typedValue}
      disabled={inputDisabled}
      onUserInput={onUserInputDispatch}
      $loading={loading}
    />
  )

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
            {inputTooltip ? <MouseoverTooltip text={inputTooltip}>{numericalInput}</MouseoverTooltip> : numericalInput}
          </div>
        </styledEl.CurrencyInputBox>

        <styledEl.CurrencyInputBox>
          <div>
            {balance && !disabled && (
              <>
                <styledEl.BalanceText>
                  <Trans>Balance</Trans>:{' '}
                  <TokenAmount amount={balance} defaultValue="0" tokenSymbol={currency} opacitySymbol />
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
