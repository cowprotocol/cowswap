import { useEffect, useMemo, useRef, useState } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { MIN_FIAT_SURPLUS_VALUE, MIN_FIAT_SURPLUS_VALUE_MODAL, MIN_SURPLUS_UNITS } from 'legacy/constants'
import { Order } from 'legacy/state/orders/actions'

import { useUsdAmount } from 'modules/usdAmount'

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
  const [surplusData, setSurplusData] = useState<Output>({
    surplusFiatValue: null,
    showFiatValue: false,
    surplusToken: null,
    surplusAmount: null,
    showSurplus: null,
  })
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

  const surplusFiatValue = useUsdAmount(surplusAmount).value
  const surplusFiatValueRef = useRef(surplusFiatValue)

  // Update the surplus amount/token
  useEffect(() => {
    setSurplusData((surplusData) => ({
      ...surplusData,
      surplusAmount,
      surplusToken,
    }))
  }, [surplusAmount, surplusToken])

  // Update the fiat value
  //  - Updates only once, when we go from not knowing it, to knowing it
  //  - This prevents flickering effects when the USD price is changing and that makes us change our mind about showing or not showing the surplus modal
  useEffect(() => {
    if (surplusFiatValueRef.current === null && surplusFiatValue !== null) {
      const showFiatValue = Number(surplusFiatValue.toExact()) >= MIN_FIAT_SURPLUS_VALUE

      setSurplusData((surplusData) => ({
        ...surplusData,
        surplusFiatValue,
        showFiatValue,
        showSurplus: shouldShowSurplus(surplusFiatValue, surplusData.surplusAmount),
      }))
    }
  }, [surplusFiatValue])

  return surplusData
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
