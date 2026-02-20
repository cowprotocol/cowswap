import { ReactNode } from 'react'

import { INITIAL_ALLOWED_SLIPPAGE_PERCENT } from '@cowprotocol/common-const'
import { percentToBps } from '@cowprotocol/common-utils'

import { AppDataUpdater } from 'modules/appData'
import { useSetTradeQuoteParams } from 'modules/tradeQuote'

import { HydrateAtom } from 'common/state/HydrateAtom'

import { QuoteObserverUpdater } from './QuoteObserverUpdater'
import { SetupYieldAmountsFromUrlUpdater } from './SetupYieldAmountsFromUrlUpdater'

import { useYieldDerivedStateToFill, useYieldDerivedState } from '../hooks/useYieldDerivedState'
import { yieldDerivedStateAtom } from '../state/yieldRawStateAtom'

export function YieldUpdaters(): ReactNode {
  const { inputCurrencyAmount } = useYieldDerivedState()

  const yieldDerivedStateToFill = useYieldDerivedStateToFill()
  useSetTradeQuoteParams({ amount: inputCurrencyAmount, partiallyFillable: false, fastQuote: true })

  return (
    <HydrateAtom atom={yieldDerivedStateAtom} state={yieldDerivedStateToFill}>
      <SetupYieldAmountsFromUrlUpdater />
      <QuoteObserverUpdater />
      <AppDataUpdater orderClass="market" slippageBips={percentToBps(INITIAL_ALLOWED_SLIPPAGE_PERCENT)} />
    </HydrateAtom>
  )
}
