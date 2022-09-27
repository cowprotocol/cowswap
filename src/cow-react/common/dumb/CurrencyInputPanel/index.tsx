import React, { useCallback, useState } from 'react'
import * as styledEl from './styled'
import { CurrencySelectButton } from 'cow-react/swap/dumb/CurrencySelectButton'
import { Currency } from '@uniswap/sdk-core'
import CurrencySearchModal from 'components/SearchModal/CurrencySearchModal'
import { formatSmartAmount } from 'utils/format'
import { FiatValue } from 'components/CurrencyInputPanel/FiatValue'
import { Trans } from '@lingui/macro'
import { PriceImpact } from 'hooks/usePriceImpact'
import { ReceiveAmount } from 'cow-react/swap/dumb/ReceiveAmount'
import { BalanceAndSubsidy } from 'hooks/useCowBalanceAndSubsidy'
import { setMaxSellTokensAnalytics } from 'utils/analytics'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import { Field } from 'state/swap/actions'
import { CurrencyInfo } from 'cow-react/common/dumb/CurrencyInputPanel/typings'

interface BuiltItProps {
  className: string
}

export interface CurrencyInputPanelProps extends Partial<BuiltItProps> {
  id: string
  loading: boolean
  showSetMax?: boolean
  allowsOffchainSigning: boolean
  currencyInfo: CurrencyInfo
  priceImpactParams?: PriceImpact
  subsidyAndBalance: BalanceAndSubsidy
  onCurrencySelection: (field: Field, currency: Currency) => void
  onUserInput: (field: Field, typedValue: string) => void
}

export function CurrencyInputPanel(props: CurrencyInputPanelProps) {
  const {
    id,
    loading,
    currencyInfo,
    className,
    priceImpactParams,
    showSetMax = false,
    onCurrencySelection,
    onUserInput,
    allowsOffchainSigning,
    subsidyAndBalance,
  } = props
  const { priceImpact, loading: priceImpactLoading } = priceImpactParams || {}
  const { field, currency, balance, fiatAmount, viewAmount, receiveAmountInfo } = currencyInfo
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
    maxBalance && onUserInputDispatch(maxBalance.toExact())
    setMaxSellTokensAnalytics()
  }, [balance, onUserInputDispatch])

  return (
    <>
      <styledEl.Wrapper id={id} className={className} withReceiveAmountInfo={!!receiveAmountInfo}>
        <styledEl.CurrencyInputBox flexibleWidth={true}>
          <div>
            <CurrencySelectButton
              onClick={() => setCurrencySearchModalOpen(true)}
              currency={currency || undefined}
              loading={loading}
            />
          </div>
          <div>
            <styledEl.NumericalInput
              className="token-amount-input"
              value={typedValue || viewAmount}
              onUserInput={onUserInputDispatch}
              $loading={loading}
            />
          </div>
        </styledEl.CurrencyInputBox>
        <styledEl.CurrencyInputBox flexibleWidth={false}>
          <div>
            {balance && (
              <>
                <styledEl.BalanceText title={balance.toExact() + ' ' + currency?.symbol}>
                  <Trans>Balance</Trans>: {formatSmartAmount(balance) || '0'} {currency?.symbol}
                </styledEl.BalanceText>
                {showSetMax && <styledEl.SetMaxBtn onClick={handleMaxInput}>(Max)</styledEl.SetMaxBtn>}
              </>
            )}
          </div>
          <div>
            <styledEl.FiatAmountText>
              <FiatValue priceImpactLoading={priceImpactLoading} fiatValue={fiatAmount} priceImpact={priceImpact} />
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
        disableNonToken={false}
      />
    </>
  )
}
