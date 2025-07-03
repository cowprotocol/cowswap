import { ReactNode, useMemo } from 'react'

import { isTruthy } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { ConfirmDetailsItem } from 'modules/trade'

import { RateInfoParams } from 'common/pure/RateInfo'

import { getExecPriceContent, getReceivedContent, getSolverContent, getSurplusConfig } from './contents'

import { SwapResultContext } from '../../../types'

interface SwapResultContentProps {
  context: SwapResultContext
  sellAmount: CurrencyAmount<Currency>
}

export function SwapResultContent({
  sellAmount,
  context: { winningSolver, receivedAmount, receivedAmountUsd, surplusAmount, surplusAmountUsd },
}: SwapResultContentProps): ReactNode {
  const rateInfoParams: RateInfoParams = useMemo(() => {
    return {
      chainId: sellAmount.currency.chainId,
      inputCurrencyAmount: sellAmount,
      outputCurrencyAmount: receivedAmount,
      activeRateFiatAmount: null,
      invertedActiveRateFiatAmount: null,
    }
  }, [sellAmount, receivedAmount])

  const contents = [
    winningSolver ? getSolverContent(winningSolver) : null,
    getReceivedContent(receivedAmount, receivedAmountUsd),
    getExecPriceContent(rateInfoParams),
    surplusAmount.greaterThan(0) ? getSurplusConfig(surplusAmount, surplusAmountUsd) : null,
  ]

  return (
    <>
      {contents.filter(isTruthy).map(({ withTimelineDot, label, content }, index) => (
        <ConfirmDetailsItem key={index} withTimelineDot={withTimelineDot} label={label}>
          {content}
        </ConfirmDetailsItem>
      ))}
    </>
  )
}
