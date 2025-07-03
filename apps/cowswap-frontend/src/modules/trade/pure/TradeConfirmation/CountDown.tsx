import { ReactNode, useEffect, useState } from 'react'

import ms from 'ms.macro'

import { useTradeQuoteCounter } from 'modules/tradeQuote'

import { QuoteCountdownWrapper } from './styled'

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
        'Refreshing quote...'
      ) : (
        <>
          Quote refresh in <b>{counter / ONE_SEC} sec</b>
        </>
      )}
    </QuoteCountdownWrapper>
  )
}
