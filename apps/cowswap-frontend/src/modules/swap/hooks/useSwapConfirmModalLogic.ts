import { useMemo } from 'react'

import { getCurrencyAddress, FractionUtils } from '@cowprotocol/common-utils'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { BridgeQuoteAmounts } from 'modules/bridge'
import { useTokensBalancesCombined } from 'modules/combinedBalances/hooks/useTokensBalancesCombined'

import { CurrencyPreviewInfo } from 'common/pure/CurrencyAmountPreview'

function checkBalanceSufficiency(inputCurrencyInfo: CurrencyPreviewInfo, balances: Record<string, string>): boolean {
  const current = inputCurrencyInfo?.amount?.currency

  if (!current) {
    return false
  }

  const normalisedAddress = getCurrencyAddress(current).toLowerCase()
  const balance = balances[normalisedAddress]

  if (!balance) {
    return false
  }

  const balanceAsCurrencyAmount = CurrencyAmount.fromRawAmount(current, balance)

  return inputCurrencyInfo.amount ? FractionUtils.lte(inputCurrencyInfo.amount, balanceAsCurrencyAmount) : false
}

export function useDisableConfirmLogic(
  inputCurrencyInfo: CurrencyPreviewInfo,
  shouldDisplayBridgeDetails: boolean,
  bridgeQuoteAmounts: BridgeQuoteAmounts | null,
): boolean {
  const { values: balances } = useTokensBalancesCombined()

  return useMemo(() => {
    if (shouldDisplayBridgeDetails && !bridgeQuoteAmounts) {
      return true
    }

    const stringBalances: Record<string, string> = {}
    Object.entries(balances).forEach(([key, value]) => {
      if (value) {
        stringBalances[key] = value.toString()
      }
    })

    return !checkBalanceSufficiency(inputCurrencyInfo, stringBalances)
  }, [balances, inputCurrencyInfo, shouldDisplayBridgeDetails, bridgeQuoteAmounts])
}

export function getButtonText(disableConfirm: boolean, inputCurrencyInfo: CurrencyPreviewInfo): string {
  if (disableConfirm) {
    const { amount } = inputCurrencyInfo
    return `Insufficient ${amount?.currency?.symbol || 'token'} balance`
  }
  return 'Confirm Swap'
}
