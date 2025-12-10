import { Dispatch, ReactNode, SetStateAction, useMemo, useState } from 'react'

import { Currency, CurrencyAmount, Price } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { useUsdAmount } from 'modules/usdAmount'

import { ReceiveAmountInfo } from '../../types'
import { getLimitPriceFromReceiveAmount } from '../../utils/getLimitPriceFromReceiveAmount'
import { getOrderTypeReceiveAmounts } from '../../utils/getOrderTypeReceiveAmounts'

interface UseTradeBasicConfirmDetailsDataParams {
  receiveAmountInfo: ReceiveAmountInfo
  hideUsdValues?: boolean
  networkCostsSuffix?: ReactNode
  networkCostsTooltipSuffix?: ReactNode
}

interface UseTradeBasicConfirmDetailsDataResult {
  isInvertedState: [boolean, Dispatch<SetStateAction<boolean>>]
  amountAfterFees: CurrencyAmount<Currency>
  amountAfterSlippage: CurrencyAmount<Currency>
  amountAfterSlippageUsd: Nullish<CurrencyAmount<Currency>>
  amountAfterFeesUsd: Nullish<CurrencyAmount<Currency>>
  limitPrice: Price<Currency, Currency> | null
  networkCostsSuffix?: ReactNode
  networkCostsTooltipSuffix?: ReactNode
}

export function useTradeBasicConfirmDetailsData(
  params: UseTradeBasicConfirmDetailsDataParams
): UseTradeBasicConfirmDetailsDataResult {
  const { receiveAmountInfo, hideUsdValues, networkCostsSuffix, networkCostsTooltipSuffix } = params

  const isInvertedState = useState(false)
  const { amountAfterFees, amountAfterSlippage } = getOrderTypeReceiveAmounts(receiveAmountInfo)

  const amountAfterSlippageUsd = useUsdAmount(hideUsdValues ? null : amountAfterSlippage).value
  const amountAfterFeesUsd = useUsdAmount(hideUsdValues ? null : amountAfterFees).value

  const limitPrice = useMemo(() => getLimitPriceFromReceiveAmount(receiveAmountInfo), [receiveAmountInfo])

  return {
    isInvertedState,
    amountAfterFees,
    amountAfterSlippage,
    amountAfterSlippageUsd,
    amountAfterFeesUsd,
    limitPrice,
    networkCostsSuffix,
    networkCostsTooltipSuffix,
  }
}

