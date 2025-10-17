import { ReactNode, useEffect, useState } from 'react'

import { Trans } from '@lingui/react/macro'
import ms from 'ms.macro'

import { useTradeQuoteCounter } from 'modules/tradeQuote'

import { QuoteCountdownWrapper, QuoteCountdownWrapperText, QuoteCountdownWrapperValue } from './styled'

const ONE_SEC = ms`1s`

export const QuoteCountdown = (): ReactNode => {
  const [blink, setBlink] = useState<boolean>(false)
  const counter = useTradeQuoteCounter()

  useEffect(() => {
    if (counter === 0) {
      setBlink(true)

      setTimeout(() => setBlink(false), ONE_SEC)
    }

    return
  }, [counter])

  const value = counter / ONE_SEC

  return (
    <QuoteCountdownWrapper blink={blink}>
      {value === 0 ? (
        <QuoteCountdownWrapperText>
          <Trans>Refreshing quote...</Trans>
        </QuoteCountdownWrapperText>
      ) : (
        <>
          <QuoteCountdownWrapperText>
            <Trans>Quote refresh in</Trans>
          </QuoteCountdownWrapperText>
          <QuoteCountdownWrapperValue>
            <Trans>{value} sec</Trans>
          </QuoteCountdownWrapperValue>
        </>
      )}
    </QuoteCountdownWrapper>
  )
}
