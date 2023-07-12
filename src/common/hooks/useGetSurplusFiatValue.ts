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

  return {
    surplusFiatValue,
    showFiatValue,
    surplusToken,
    surplusAmount,
  }
}
