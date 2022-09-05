import React, { useCallback, useState } from 'react'
import * as styledEl from './styled'
import { CurrencySelectButton } from '../CurrencySelectButton'
import { Currency } from '@uniswap/sdk-core'
import CurrencySearchModal from 'components/SearchModal/CurrencySearchModal'
import { formatSmartAmount } from 'utils/format'
import { CurrencyInfo } from 'pages/NewSwap/typings'
import { FiatValue } from 'components/CurrencyInputPanel/FiatValue'
import { useSwapActionHandlers } from 'state/swap/hooks'
import { Trans } from '@lingui/macro'
import { PriceImpact } from 'hooks/usePriceImpact'
import { ReceiveAmount } from 'pages/NewSwap/pureComponents/ReceiveAmount'
import useCowBalanceAndSubsidy from 'hooks/useCowBalanceAndSubsidy'
import { useWalletInfo } from 'hooks/useWalletInfo'
import { setMaxSellTokensAnalytics } from 'utils/analytics'

interface BuiltItProps {
  className: string
}

export interface CurrencyInputPanelProps extends Partial<BuiltItProps> {
  currencyInfo: CurrencyInfo
  priceImpactParams?: PriceImpact
  showSetMax?: boolean
}

export function CurrencyInputPanel(props: CurrencyInputPanelProps) {
  const loading = false
  const { currencyInfo, className, priceImpactParams, showSetMax = false } = props
  const { priceImpact, loading: priceImpactLoading } = priceImpactParams || {}
  const { field, currency, balance, fiatAmount, viewAmount, receiveAmountInfo } = currencyInfo
  const [isCurrencySearchModalOpen, setCurrencySearchModalOpen] = useState(false)
  const [typedValue, setTypedValue] = useState('')

  const subsidyAndBalance = useCowBalanceAndSubsidy()
  const { allowsOffchainSigning } = useWalletInfo()

  const { onCurrencySelection, onUserInput: onUserInputDispatch } = useSwapActionHandlers()
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
        showCurrencyAmount={false}
        disableNonToken={false}
      />
    </>
  )
}
