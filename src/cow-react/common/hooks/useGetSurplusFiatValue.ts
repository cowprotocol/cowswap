import { useMemo } from 'react'
import { Token, CurrencyAmount } from '@uniswap/sdk-core'
import { Order } from 'state/orders/actions'
import { getExecutedSummaryData } from '@cow/utils/getExecutedSummaryData'
import { useCoingeckoUsdValue } from '@src/hooks/useStablecoinPrice'
import { MIN_FIAT_SURPLUS_VALUE } from 'constants/index'

type Output = {
  surplusFiatValue: CurrencyAmount<Token> | null
  surplusAmount: CurrencyAmount<Token> | undefined
  surplusToken: Token | undefined
  showFiatValue: boolean
}

export function useGetSurplusData(order: Order | undefined): Output {
  const { surplusAmount, surplusToken } = useMemo(() => {
    const output: { surplusToken?: Token; surplusAmount?: CurrencyAmount<Token> } = {}

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
