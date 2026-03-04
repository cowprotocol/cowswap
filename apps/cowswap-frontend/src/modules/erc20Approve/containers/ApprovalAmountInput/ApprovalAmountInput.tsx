import React, { ReactNode, useCallback, useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { tryParseCurrencyAmount } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Trans, useLingui } from '@lingui/react/macro'

import { Field } from 'legacy/state/types'

import { useUsdAmount } from 'modules/usdAmount'

import { useIsProviderNetworkDeprecated } from 'common/hooks/useIsProviderNetworkDeprecated'
import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'
import { CurrencyInputPanel } from 'common/pure/CurrencyInputPanel'
import { CurrencyInfo } from 'common/pure/CurrencyInputPanel/types'

import * as styledEl from './styled'

import { useCustomApproveAmountInputState, useUpdateOrResetCustomApproveAmountInputState } from '../../state'

const noop = (): void => {}

type ApprovalAmountInputProps = {
  tokenWithLogo: TokenWithLogo | null
  // amount that was set by the user or by default (by default, it is equivalent to amountToSwap)
  initialApproveAmount: CurrencyAmount<Currency> | null | undefined
  // amount that needed to be swapped
  amountToSwap: CurrencyAmount<Currency> | null | undefined
  onReset: () => void
}

export function ApprovalAmountInput({
  initialApproveAmount,
  tokenWithLogo,
  onReset,
  amountToSwap,
}: ApprovalAmountInputProps): ReactNode {
  const isProviderNetworkUnsupported = useIsProviderNetworkUnsupported()
  const isProviderNetworkDeprecated = useIsProviderNetworkDeprecated()

  const [updateCustomApproveAmountInput] = useUpdateOrResetCustomApproveAmountInputState()
  const customAmountValueState = useCustomApproveAmountInputState()

  const customAmountValue = useMemo(
    () => customAmountValueState.amount ?? initialApproveAmount ?? amountToSwap,
    [customAmountValueState, initialApproveAmount, amountToSwap],
  )

  const usdAmount = useUsdAmount(customAmountValue)

  const currencyInfo = useMemo(() => {
    return {
      field: Field.INPUT,
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
      // function can return undefined
      if (!value) {
        updateCustomApproveAmountInput({ amount: null, isChanged: true, isInvalid: true })
      } else {
        const isInvalid = amountToSwap ? value.lessThan(amountToSwap) : false
        updateCustomApproveAmountInput({ amount: value, isChanged: true, isInvalid })
      }
    },
    [updateCustomApproveAmountInput, tokenWithLogo, amountToSwap],
  )

  const { t } = useLingui()

  const resetLabel = customAmountValueState.isInvalid ? t`Set to trade` : t`Reset`

  return (
    <styledEl.EditWrapper>
      <styledEl.InputHeader>
        <Trans>Approval amount</Trans> <styledEl.ResetBtn onClick={onReset}>{resetLabel}</styledEl.ResetBtn>
      </styledEl.InputHeader>
      <CurrencyInputPanel
        className={'custom-input-panel'}
        id={'custom-approve-amount-input'}
        chainId={tokenWithLogo?.chainId}
        areCurrenciesLoading={false}
        bothCurrenciesSet={false}
        isProviderNetworkUnsupported={isProviderNetworkUnsupported}
        isProviderNetworkDeprecated={isProviderNetworkDeprecated}
        allowsOffchainSigning={false}
        currencyInfo={currencyInfo}
        isInvalid={customAmountValueState.isInvalid}
        onCurrencySelection={noop}
        onUserInput={onUserInput}
        openTokenSelectWidget={noop}
        tokenSelectorDisabled
      />
    </styledEl.EditWrapper>
  )
}
