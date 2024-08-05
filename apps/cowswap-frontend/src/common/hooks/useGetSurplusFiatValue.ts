import { useMemo } from 'react'

import { MIN_FIAT_SURPLUS_VALUE, MIN_FIAT_SURPLUS_VALUE_MODAL, MIN_SURPLUS_UNITS } from '@cowprotocol/common-const'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { Order } from 'legacy/state/orders/actions'

import { useUsdAmount } from 'modules/usdAmount'

import { useSafeMemo } from 'common/hooks/useSafeMemo'
import { getExecutedSummaryData } from 'utils/getExecutedSummaryData'
import { ParsedOrder } from 'utils/orderUtils/parseOrder'

export type SurplusData = {
  surplusFiatValue: Nullish<CurrencyAmount<Currency>>
  surplusAmount: Nullish<CurrencyAmount<Currency>>
  surplusToken: Nullish<Currency>
  surplusPercent: Nullish<string>
  showFiatValue: boolean
  showSurplus: boolean | null
}

export function useGetSurplusData(order: Order | ParsedOrder | undefined): SurplusData {
  const { surplusAmount, surplusToken, surplusPercent } = useMemo(() => {
    const output: { surplusToken?: Currency; surplusAmount?: CurrencyAmount<Currency>; surplusPercent?: string } = {}

    if (order) {
      const summaryData = getExecutedSummaryData(order)
      output.surplusAmount = summaryData.surplusAmount
      output.surplusToken = summaryData.surplusToken
      output.surplusPercent = summaryData.surplusPercent
    }

    return output
  }, [order])

  const surplusFiatValue = useUsdAmount(surplusAmount).value
  const showFiatValue = Number(surplusFiatValue?.toExact()) >= MIN_FIAT_SURPLUS_VALUE

  const showSurplus = shouldShowSurplus(surplusFiatValue, surplusAmount)

  return useSafeMemo(
    () => ({
      surplusFiatValue,
      showFiatValue,
      surplusToken,
      surplusAmount,
      surplusPercent,
      showSurplus,
    }),
    [surplusFiatValue, showFiatValue, surplusToken, surplusAmount, surplusPercent, showSurplus]
  )
}

function shouldShowSurplus(
  fiatAmount: Nullish<CurrencyAmount<Currency>>,
  surplusAmount: Nullish<CurrencyAmount<Currency>>
): boolean | null {
  if (fiatAmount) {
    // When there's a fiat amount, use that to decide whether to display the modal
    return Number(fiatAmount.toFixed(fiatAmount.currency.decimals)) > MIN_FIAT_SURPLUS_VALUE_MODAL
  } else if (surplusAmount) {
    // If no fiat value, check whether surplus units are > MIN_SURPLUS_UNITS
    return Number(surplusAmount.toFixed(surplusAmount.currency.decimals)) > MIN_SURPLUS_UNITS
  }

  // Otherwise, we don't know whether surplus should, return `null` to indicate that
  return null
}
