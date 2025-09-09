import React, { ReactNode, useCallback, useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { tryParseCurrencyAmount } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import {
  useCustomApproveAmountState,
  useUpdateCustomApproveAmount,
} from 'modules/erc20Approve/state/customApproveAmountState'

import * as styledEl from './styled'

import { CurrencyInputPanel } from '../../../../common/pure/CurrencyInputPanel'
import { CurrencyInfo } from '../../../../common/pure/CurrencyInputPanel/types'
import { Field } from '../../../../legacy/state/types'

export function ApprovalAmountInput({
  initialAmount,
  tokenWithLogo,
}: {
  tokenWithLogo: TokenWithLogo
  initialAmount: CurrencyAmount<Currency>
}): ReactNode {
  const setCustomApproveAmount = useUpdateCustomApproveAmount()
  const customAmountValueState = useCustomApproveAmountState()

  const customAmountValue = useMemo(
    () => customAmountValueState.amount ?? initialAmount,
    [customAmountValueState, initialAmount],
  )

  const currencyInfo = useMemo(() => {
    return {
      field: 'INPUT',
      currency: customAmountValue.currency,
      amount: customAmountValue,
      isIndependent: true,
      receiveAmountInfo: null,
      balance: null,
      fiatAmount: null,
    } as CurrencyInfo
  }, [customAmountValue])

  const onUserInput = useCallback(
    (_: Field, typedValue: string) => {
      const currency = tokenWithLogo

      if (!currency) return

      const value = tryParseCurrencyAmount(typedValue, currency)
      setCustomApproveAmount({ amount: value, isChanged: true })
    },
    [setCustomApproveAmount, tokenWithLogo],
  )

  const onReset = useCallback(() => {
    setCustomApproveAmount({ amount: initialAmount, isChanged: false })
  }, [setCustomApproveAmount, initialAmount])

  return (
    <styledEl.EditWrapper>
      <styledEl.InputHeader>
        Approval amount: <styledEl.ResetBtn onClick={onReset}>Reset</styledEl.ResetBtn>
      </styledEl.InputHeader>
      <CurrencyInputPanel
        id={'test'}
        chainId={tokenWithLogo.chainId}
        areCurrenciesLoading={false}
        bothCurrenciesSet={false}
        isChainIdUnsupported={false}
        allowsOffchainSigning={false}
        currencyInfo={currencyInfo}
        onCurrencySelection={() => {}}
        onUserInput={onUserInput}
        openTokenSelectWidget={() => {}}
        tokenSelectorDisabled
      />
    </styledEl.EditWrapper>
  )
}
