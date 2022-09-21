import React, { useCallback, useState } from 'react'
import * as styledEl from './styled'
import { CurrencySelectButton } from '../CurrencySelectButton'
import { Currency } from '@uniswap/sdk-core'
import CurrencySearchModal from 'components/SearchModal/CurrencySearchModal'
import { formatSmartAmount } from 'utils/format'
import { CurrencyInfo } from 'pages/NewSwap/typings'
import { FiatValue } from 'components/CurrencyInputPanel/FiatValue'
import { Trans } from '@lingui/macro'
import { PriceImpact } from 'hooks/usePriceImpact'
import { ReceiveAmount } from 'pages/NewSwap/pureComponents/ReceiveAmount'
import { BalanceAndSubsidy } from 'hooks/useCowBalanceAndSubsidy'
import { setMaxSellTokensAnalytics } from 'utils/analytics'
import { SwapActions } from 'state/swap/hooks'
import { maxAmountSpend } from 'utils/maxAmountSpend'

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
  swapActions: SwapActions
  subsidyAndBalance: BalanceAndSubsidy
}

export function CurrencyInputPanel(props: CurrencyInputPanelProps) {
  const {
    id,
    loading,
    currencyInfo,
    className,
    priceImpactParams,
    showSetMax = false,
    swapActions,
    allowsOffchainSigning,
    subsidyAndBalance,
  } = props
  const { onUserInput: onUserInputDispatch, onCurrencySelection } = swapActions
  const { priceImpact, loading: priceImpactLoading } = priceImpactParams || {}
  const { field, currency, balance, fiatAmount, viewAmount, receiveAmountInfo } = currencyInfo
  const [isCurrencySearchModalOpen, setCurrencySearchModalOpen] = useState(false)

  const onCurrencySelect = useCallback(
    (currency: Currency) => {
      onCurrencySelection(field, currency)
    },
    [onCurrencySelection, field]
  )
  const onUserInput = useCallback(
    (typedValue: string) => {
      onUserInputDispatch(field, typedValue)
    },
    [onUserInputDispatch, field]
  )
  const handleMaxInput = useCallback(() => {
    const maxBalance = maxAmountSpend(balance || undefined)
    maxBalance && onUserInput(maxBalance.toExact())
    setMaxSellTokensAnalytics()
  }, [balance, onUserInput])

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
              value={viewAmount}
              onUserInput={onUserInput}
              $loading={loading}
            />
          </div>
        </styledEl.CurrencyInputBox>
        <styledEl.CurrencyInputBox flexibleWidth={false}>
          <div>
            {balance && (
              <>
                <styledEl.BalanceText>
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
