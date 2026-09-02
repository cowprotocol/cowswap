import { ReactNode, useCallback } from 'react'

import { Field } from 'legacy/state/types'

import { useRwaTokenIds } from 'modules/rwa'
import { SwapWidget, useOnCurrencySelection } from 'modules/swap'

import { useRwaAlternativeQuote } from '../../hooks/useRwaAlternativeQuote'
import { RwaAlternativeQuote } from '../../pure/RwaAlternativeQuote'

export function RwaWidget(): ReactNode {
  const prioritizedTokenIds = useRwaTokenIds()
  const alternativeQuote = useRwaAlternativeQuote()
  const onCurrencySelection = useOnCurrencySelection()

  const onSwitch = useCallback(() => {
    if (!alternativeQuote) return

    onCurrencySelection(alternativeQuote.field, alternativeQuote.alternativeCurrency)
  }, [alternativeQuote, onCurrencySelection])

  const alternativeQuoteNode = alternativeQuote ? (
    <RwaAlternativeQuote info={alternativeQuote} onSwitch={onSwitch} />
  ) : undefined

  return (
    <SwapWidget
      prioritizedTokenIds={prioritizedTokenIds}
      inputCurrencyTopContent={alternativeQuote?.field === Field.INPUT ? alternativeQuoteNode : undefined}
      outputCurrencyTopContent={alternativeQuote?.field === Field.OUTPUT ? alternativeQuoteNode : undefined}
    />
  )
}
