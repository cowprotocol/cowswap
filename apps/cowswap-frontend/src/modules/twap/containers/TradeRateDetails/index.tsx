import { ReactNode, useCallback, useMemo, useState } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import {
  TradeFeesAndCosts,
  TradeTotalCostsDetails,
  getTotalCosts,
  useGetReceiveAmountInfo,
  useShouldPayGas,
} from 'modules/trade'
import { RowRewards } from 'modules/tradeWidgetAddons/containers/RowRewards'
import { NetworkCostsTooltipSuffix } from 'modules/tradeWidgetAddons/pure/NetworkCostsTooltipSuffix'

import { NetworkCostsSuffix } from 'common/pure/NetworkCostsSuffix'
import { RateInfoParams } from 'common/pure/RateInfo'

function useTotalCosts(): CurrencyAmount<Currency> | null {
  const receiveAmountInfo = useGetReceiveAmountInfo()

  return useMemo(() => {
    if (!receiveAmountInfo) return null

    return getTotalCosts(receiveAmountInfo)
  }, [receiveAmountInfo])
}

interface TwapRateDetailsProps {
  rateInfoParams?: RateInfoParams
}

export function TwapRateDetails({ rateInfoParams }: TwapRateDetailsProps): ReactNode {
  const receiveAmountInfo = useGetReceiveAmountInfo()
  const [isFeeDetailsOpen, setFeeDetailsOpen] = useState(false)
  const totalCosts = useTotalCosts()
  const shouldPayGas = useShouldPayGas()

  const toggleAccordion = useCallback(() => {
    setFeeDetailsOpen((prev) => !prev)
  }, [])

  if (!rateInfoParams || !receiveAmountInfo || !totalCosts) {
    return null
  }

  return (
    <TradeTotalCostsDetails
      rateInfoParams={rateInfoParams}
      totalCosts={totalCosts}
      isFeeDetailsOpen={isFeeDetailsOpen}
      toggleAccordion={toggleAccordion}
    >
      <>
        <TradeFeesAndCosts
          receiveAmountInfo={receiveAmountInfo}
          networkCostsSuffix={shouldPayGas ? <NetworkCostsSuffix /> : null}
          networkCostsTooltipSuffix={<NetworkCostsTooltipSuffix />}
        />
        <RowRewards />
      </>
    </TradeTotalCostsDetails>
  )
}
