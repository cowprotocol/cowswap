import { useMemo } from 'react'

import { getCurrencyAddress } from '@cowprotocol/common-utils'
import type { BigNumber } from '@ethersproject/bignumber'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useBridgeQuoteAmounts } from 'modules/bridge'

import type { CurrencyPreviewInfo } from 'common/pure/CurrencyAmountPreview'

export type DisableConfirmParams = {
  inputCurrencyInfo: CurrencyPreviewInfo
  shouldDisplayBridgeDetails: boolean
  bridgeQuoteAmounts: ReturnType<typeof useBridgeQuoteAmounts>
  balances: { [address: string]: BigNumber | undefined }
}

export function useDisableConfirm({
  inputCurrencyInfo,
  shouldDisplayBridgeDetails,
  bridgeQuoteAmounts,
  balances,
}: DisableConfirmParams): boolean {
  return useMemo(() => {
    if (shouldDisplayBridgeDetails && !bridgeQuoteAmounts) {
      return true
    }

    const amount = inputCurrencyInfo?.amount
    const currency = amount?.currency ?? null
    if (!amount || !currency) return true

    const normalisedAddress = getCurrencyAddress(currency).toLowerCase()
    const balance = balances[normalisedAddress]

    return !hasSufficientBalance({ amount, balance, currency })
  }, [balances, inputCurrencyInfo, shouldDisplayBridgeDetails, bridgeQuoteAmounts])
}

function hasSufficientBalance({
  amount,
  balance,
  currency,
}: {
  amount: CurrencyAmount<Currency>
  balance: BigNumber | undefined
  currency: Currency
}): boolean {
  const balanceRaw = balance?.toString() ?? '0'
  const balanceAmount = CurrencyAmount.fromRawAmount(currency, balanceRaw)
  return amount.equalTo(balanceAmount) || amount.lessThan(balanceAmount)
}
