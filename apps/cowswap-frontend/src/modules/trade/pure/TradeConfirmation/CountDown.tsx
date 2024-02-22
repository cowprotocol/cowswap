import { useEffect, useState } from 'react'

import { QuoteCountdownWrapper } from './styled'

interface CountdownComponentProps {
  nextUpdateAt: number
}

export const QuoteCountdown = ({ nextUpdateAt }: CountdownComponentProps) => {
  const [blink, setBlink] = useState<boolean>(false)

  useEffect(() => {
    if (Math.ceil(nextUpdateAt / 1000) <= 1) {
      setBlink(true)
      const timer = setTimeout(() => setBlink(false), 1000)

      return () => clearTimeout(timer)
    }

    return
  }, [nextUpdateAt])

  return (
    <QuoteCountdownWrapper blink={blink}>
      Quote refresh in <b>{Math.ceil(nextUpdateAt / 1000)} sec</b>
    </QuoteCountdownWrapper>
  )
}
