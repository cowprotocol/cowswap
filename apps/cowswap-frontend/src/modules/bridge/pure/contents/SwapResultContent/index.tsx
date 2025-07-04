import { ReactNode } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useSafeMemo } from 'common/hooks/useSafeMemo'
import { RateInfoParams } from 'common/pure/RateInfo'

import { ExecPriceContent, ReceivedContent, SolverContent, SurplusConfig } from './contents'

import { SwapResultContext } from '../../../types'

interface SwapResultContentProps {
  context: SwapResultContext
  sellAmount: CurrencyAmount<Currency>
}

export function SwapResultContent({
  sellAmount,
  context: { winningSolver, receivedAmount, receivedAmountUsd, surplusAmount, surplusAmountUsd },
}: SwapResultContentProps): ReactNode {
  const rateInfoParams: RateInfoParams = useSafeMemo(() => {
    return {
      chainId: sellAmount.currency.chainId,
      inputCurrencyAmount: sellAmount,
      outputCurrencyAmount: receivedAmount,
      activeRateFiatAmount: null,
      invertedActiveRateFiatAmount: null,
    }
  }, [sellAmount, receivedAmount])

  return (
    <>
      {winningSolver && <SolverContent winningSolver={winningSolver} />}
      <ReceivedContent receivedAmount={receivedAmount} receivedAmountUsd={receivedAmountUsd} />
      <ExecPriceContent rateInfoParams={rateInfoParams} />
      {surplusAmount.greaterThan(0) && (
        <SurplusConfig surplusAmount={surplusAmount} surplusAmountUsd={surplusAmountUsd} />
      )}
    </>
  )
}
