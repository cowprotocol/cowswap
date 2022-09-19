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

interface BuiltItProps {
  className: string
}

export interface CurrencyInputPanelProps extends Partial<BuiltItProps> {
  showSetMax?: boolean
  allowsOffchainSigning: boolean
  currencyInfo: CurrencyInfo
  priceImpactParams?: PriceImpact
  swapActions: SwapActions
  subsidyAndBalance: BalanceAndSubsidy
}

export function CurrencyInputPanel(props: CurrencyInputPanelProps) {
  const loading = false
  const {
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
  const [typedValue, setTypedValue] = useState('')

  const onCurrencySelect = useCallback(
    (currency: Currency) => {
      onCurrencySelection(field, currency)
    },
    [onCurrencySelection, field]
  )
  const onUserInput = useCallback(
    (typedValue: string) => {
      setTypedValue(typedValue)
      onUserInputDispatch(field, typedValue)
    },
    [onUserInputDispatch, field]
  )
  const handleMaxInput = useCallback(() => {
    balance && onUserInput(balance.toExact())
    setMaxSellTokensAnalytics()
  }, [balance, onUserInput])

  return (
    <>
      <styledEl.Wrapper className={className} withReceiveAmountInfo={!!receiveAmountInfo}>
        <styledEl.CurrencyInputBox>
          <div>
            <CurrencySelectButton onClick={() => setCurrencySearchModalOpen(true)} currency={currency || undefined} />
          </div>
          <div>
            <styledEl.NumericalInput value={viewAmount || typedValue} onUserInput={onUserInput} $loading={loading} />
          </div>
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
            <styledEl.BalanceText>
              <FiatValue priceImpactLoading={priceImpactLoading} fiatValue={fiatAmount} priceImpact={priceImpact} />
            </styledEl.BalanceText>
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
