import { useMemo } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { MIN_FIAT_SURPLUS_VALUE, MIN_FIAT_SURPLUS_VALUE_MODAL, MIN_SURPLUS_UNITS } from 'legacy/constants'
import { useCoingeckoUsdValue } from 'legacy/hooks/useStablecoinPrice'
import { Order } from 'legacy/state/orders/actions'

import { getExecutedSummaryData } from 'utils/getExecutedSummaryData'
import { ParsedOrder } from 'utils/orderUtils/parseOrder'

type Output = {
  surplusFiatValue: Nullish<CurrencyAmount<Currency>>
  surplusAmount: Nullish<CurrencyAmount<Currency>>
  surplusToken: Nullish<Currency>
  showFiatValue: boolean
  showSurplus: boolean | null
}

export function useGetSurplusData(order: Order | ParsedOrder | undefined): Output {
  const { surplusAmount, surplusToken } = useMemo(() => {
    const output: { surplusToken?: Currency; surplusAmount?: CurrencyAmount<Currency> } = {}

    if (order) {
      const summaryData = getExecutedSummaryData(order)
      output.surplusAmount = summaryData.surplusAmount
      output.surplusToken = summaryData.surplusToken
    }

    return output
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(order)])

  const surplusFiatValue = useCoingeckoUsdValue(surplusAmount)
  const showFiatValue = Number(surplusFiatValue?.toExact()) >= MIN_FIAT_SURPLUS_VALUE

  const showSurplus = shouldShowSurplus(surplusFiatValue, surplusAmount)

  return {
    surplusFiatValue,
    showFiatValue,
    surplusToken,
    surplusAmount,
    showSurplus,
  }
}

function shouldShowSurplus(
  fiatAmount: Nullish<CurrencyAmount<Currency>>,
  surplusAmount: Nullish<CurrencyAmount<Currency>>
): boolean | null {
  if (fiatAmount) {
    // When there's a fiat amount, use that to decide whether to display the modal
    return Number(fiatAmount.toFixed(3)) > MIN_FIAT_SURPLUS_VALUE_MODAL
  } else if (surplusAmount) {
    // If no fiat value, check whether surplus units are > MIN_SURPLUS_UNITS
    return Number(surplusAmount.toFixed(3)) > MIN_SURPLUS_UNITS
  }

  // Otherwise, we don't know whether surplus should, return `null` to indicate that
  return null
}
