import React, { ReactNode, useCallback, useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { tryParseCurrencyAmount } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Field } from 'legacy/state/types'

import { useUsdAmount } from 'modules/usdAmount'

import * as styledEl from './styled'

import { CurrencyInputPanel } from '../../../../common/pure/CurrencyInputPanel'
import { CurrencyInfo } from '../../../../common/pure/CurrencyInputPanel/types'
import { useCustomApproveAmountInputState, useUpdateOrResetCustomApproveAmountInputState } from '../../state'

export function ApprovalAmountInput({
  initialAmount,
  tokenWithLogo,
  onReset,
}: {
  tokenWithLogo: TokenWithLogo | null
  initialAmount: CurrencyAmount<Currency> | null | undefined
  onReset: () => void
}): ReactNode {
  const [updateCustomApproveAmountInput] = useUpdateOrResetCustomApproveAmountInputState()
  const customAmountValueState = useCustomApproveAmountInputState()

  const customAmountValue = useMemo(
    () => customAmountValueState.amount ?? initialAmount,
    [customAmountValueState, initialAmount],
  )

  const usdAmount = useUsdAmount(customAmountValue)

  const currencyInfo = useMemo(() => {
    return {
      field: 'INPUT',
      currency: customAmountValue?.currency,
      amount: customAmountValue,
      isIndependent: true,
      receiveAmountInfo: null,
      balance: null,
      fiatAmount: usdAmount.value,
    } as CurrencyInfo
  }, [customAmountValue, usdAmount])

  const onUserInput = useCallback(
    (_: Field, typedValue: string) => {
      const currency = tokenWithLogo

      if (!currency) return

      const value = tryParseCurrencyAmount(typedValue, currency)
      const isInvalid = initialAmount ? value.lessThan(initialAmount) : false
      updateCustomApproveAmountInput({ amount: value, isChanged: true, isInvalid })
    },
    [updateCustomApproveAmountInput, tokenWithLogo, initialAmount],
  )

  const resetLabel = customAmountValueState.isInvalid ? 'Set to trade' : 'Reset'

  return (
    <styledEl.EditWrapper>
      <styledEl.InputHeader>
        Approval amount: <styledEl.ResetBtn onClick={onReset}>{resetLabel}</styledEl.ResetBtn>
      </styledEl.InputHeader>
      <CurrencyInputPanel
        id={'custom-approve-amount-input'}
        chainId={tokenWithLogo?.chainId}
        areCurrenciesLoading={false}
        bothCurrenciesSet={false}
        isChainIdUnsupported={false}
        allowsOffchainSigning={false}
        currencyInfo={currencyInfo}
        isInvalid={customAmountValueState.isInvalid}
        onCurrencySelection={() => {}}
        onUserInput={onUserInput}
        openTokenSelectWidget={() => {}}
        tokenSelectorDisabled
      />
    </styledEl.EditWrapper>
  )
}
